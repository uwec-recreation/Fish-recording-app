var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {
     useNewUrlParser: true,
     useCreateIndex: true,
     useUnifiedTopology: true
});

module.exports = {mongoose};
