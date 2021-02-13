var config = require('./config');
var createError = require('http-errors');
var express = require('express');
var path = require('path');

const bodyParser = require('body-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

const GoogleMeet = require('./google-meet');

const MeetSchedule = require('./Model/meetSchedule');

mongoose.Promise = require('bluebird');

const connect = mongoose.connect(config.MONGO_SRV, {
    useMongoClient: true,
    /* other options */
});


var app = express();
app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public'), { index: ["index.html", "index.htm"] }));

app.get('/list', (req, res) => {
    MeetSchedule.find({}).then(meetSchedule => {
        res.json({ "meetSchedule": meetSchedule })

    })
});


app.post('/postlink', (req, res) => {
    req.body.startTime = new Date(req.body.startTime).toLocaleString("en-US", { timeZone: "Indian/Christmas" });
    req.body.endTime = new Date(req.body.endTime).toLocaleString("en-US", { timeZone: "Indian/Christmas" });
    if(req.body.pwd != config.securityCode){
        console.log("Check Code");
        res.statusCode = 401;
        return res;
    }
    delete req.body.pwd;
    MeetSchedule.create(req.body)
        .then(meetSchedule => {
            if (meetSchedule) {
                res.statusCode = 200;
            } else {
                res.statusCode = 500;
            }
        }).catch((err) => {
            console.log("Couldn't create a new URl instance");
            console.log(err);
        })
    res.redirect("/");
});

app.get('/Cancel/:ScheduleID', (req, res, next) => {
    MeetSchedule.findById(req.params.ScheduleID).then(meetSchedule => {
        if (meetSchedule.joined == true) {
            meetSchedule.endTime = Date.now();
            meetSchedule.save();
        }
        else {
            console.log("TRYING TO CANCEL: " + req.params.ScheduleID);
            MeetSchedule.findByIdAndRemove(req.params.ScheduleID).then((resp) => {
                res.statusCode = 200;
            }, (err) => next(err))
                .catch((err) => next(err));
        }
    })
})

app.use(function (req, res, next) {
    next(createError(404));
});
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
const port = 80;

// Values
let email = config.EMAIL;
let password = config.PASSWORD;

let head = config.head;
let strict = config.strict;

obj = new GoogleMeet(email, password, head, strict);

connect.then(() => {
    console.log("Connected correctly to server");
    let isRunning = false;
    setInterval(() => {
        if (isRunning) {
            //  console.log("Sad")
        } else {
            isRunning = true;
            // console.log("Checking After 5 Sec")
            MeetSchedule.find({}).then(meetSchedule => {
                let flag = true;

                console.log(meetSchedule);
                for (let i = 0; i < meetSchedule.length; i++) {
                    if (meetSchedule[i].joined !== true) {
                        //   console.log("Aint Joined this " + i)
                        if (meetSchedule[i].startTime < Date.now()) {
                            //  console.log(`Request for joining meet ${meetSchedule[i].meetLink}`);
                            flag = false;
                            obj.schedule(meetSchedule[i].meetLink);
                            MeetSchedule.findOneAndUpdate({ _id: meetSchedule[i]._id }, { $set: { joined: true } }, { new: true }).then(meetSchedule => {
                                console.log("Updated in DB");
                                isRunning = false;
                            });
                        }
                    } else {
                        // console.log(" Joined " + i)
                        if (meetSchedule[i].endTime < Date.now()) {
                            console.log(`Request for leaving meet ${meetSchedule[i].meetLink}`);
                            flag = false;
                            obj.end();
                            MeetSchedule.deleteOne({ _id: meetSchedule[i]._id }).then(err => {
                                //    console.log("Deleted From DB")
                                isRunning = false;

                            })
                        }
                    }
                }
                if (flag)
                    isRunning = false;

            });
        }
    }, 300000)

    app.listen(port, () => {
        console.log("SERVER CONNECTED at port " + port);

    });
}, (err) => { console.log(err); });
