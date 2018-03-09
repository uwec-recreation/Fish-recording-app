var mongoose = require('mongoose');
const validator = require('validator');
require('mongoose-moment')(mongoose);
var Moment = require('moment');

var ContestantSchema = new mongoose.Schema( {
  firstName: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  ticket: {
    type: Number,
    required: true,
    unique: true
  },
  fish: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  weight: {
    type: Number,
    required: true
  },
  createdAt: {
    type: 'Moment'
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

var Contestant = mongoose.model('Contestant', ContestantSchema)

module.exports = {Contestant};
