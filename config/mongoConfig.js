const mongoose = require('mongoose');
require('dotenv/config');

const mongoDb = process.env.MONGO_URI;

function initializeMongoServer() {
  mongoose.connect(mongoDb, { useNewUrlParser: true });
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'mongo connection error'));

  db.once('open', () => {
    console.log(`MongoDB successfully connected`);
  });
}

module.exports = { initializeMongoServer };
