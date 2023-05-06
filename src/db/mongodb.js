const mongoose = require('mongoose');

mongoose.connect('mongodb://root:123456@127.0.0.1:27017/stress_monitor');

mongoose.Promise = global.Promise;

module.exports = mongoose;
