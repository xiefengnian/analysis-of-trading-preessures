const mongoose = require('mongoose');
const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://test:test@localhost:27017/stress_monitor';

console.log('MONGO_URL', MONGO_URL);

mongoose.connect(MONGO_URL);

mongoose.Promise = global.Promise;

module.exports = mongoose;
