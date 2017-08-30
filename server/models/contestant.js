var mongoose = require('mongoose');
const validator = require('validator');

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
    type: String,
    required: true,
    validate: {
      validator: validator.isDecimal,
      message: '{VALUE} is not a valid decimal'
    }
  },
  createdAt: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

var Contestant = mongoose.model('Contestant', ContestantSchema)

module.exports = {Contestant};
