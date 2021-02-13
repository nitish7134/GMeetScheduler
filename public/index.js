function GetScheduleList() {
    $.ajax({
        url: "/list",
        type: "GET",
        success: function (response) {
            console.log(response)
            var mainContainer = document.getElementById("mainContainer");
            var output = [];
            var schedule = response.meetSchedule;
            for (var i = 0; i < schedule.length; i++) {
                var item = (`
                    <div class="card text-white bg-dark m-1" style="max-width: 18rem;">
                        <div class="card-header">Id: ${i + 1}
                        </div>
                        <div class="card-body">
                            <p class="card-title">Meet Url: ${schedule[i].meetLink}
                            </p>
                             <p class="card-title">Start Time: ${schedule[i].startTime}
                            </p>
                             <p class="card-title">EndTime: ${schedule[i].endTime}
                            </p>
                            <button onclick="CancelThis('${schedule[i]._id}');" class="btn btn-primary">Cancel This</button>
                        </div>
                    </div>`);
                output.push(item);
            }
            mainContainer.innerHTML = output.join('');
        }, error: function (error) {
            console.log("404");
            console.log(error);
        }
    })
}
function CancelThis(id){
    console.log("Trying to cancel ", id)
    $.ajax({
        url: "/Cancel/"+id,
        type:"GET",
        credentials: 'same-origin',
        success: function (response) {
            window.location.reload();
        }

    });
}

function postSchedule() {
    var rawData = $('#MeetUrlForm').serializeArray();
    console.log(rawData);
    var itemJSON = {};
    itemJSON.meetLink = rawData[0].value;
    itemJSON.startTime = rawData[1].value;
    itemJSON.endTime = rawData[2].value;
    itemJSON.pwd = rawData[3].value;
    if(!itemJSON.meetLink.includes("meet")){
        itemJSON.meetLink = "https://meet.google.com/" +itemJSON.meetLink
    }
    console.log(itemJSON);
    $.ajax({
        url: "/postlink",
        type: "POST",
        data: itemJSON,
        credentials: 'same-origin',
        success: function (response) {
            console.log("Posted item successfully");
            console.log(response);
            itemId = response._id;
        }, error(err) {
            console.log(err);
        }
    });

}
