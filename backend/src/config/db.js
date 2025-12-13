const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/intern-assignment';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB || undefined });
  console.log('MongoDB connected');
  return mongoose.connection;
};

module.exports = connectDB;


