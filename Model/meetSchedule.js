  
const { defer } = require('bluebird');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var meetSchedule = new Schema({
  meetLink: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  joined: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('meetSchedule', meetSchedule);