const mongoose = require('mongoose');
var DB_URI;

DB_URI = 'mongodb+srv://admin:admin123@wavss-cluster.xco7y.mongodb.net/WAVSS?retryWrites=true&w=majority';

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var conn = mongoose.connection;
conn.on('connected', function () {
    console.log('MongoDB Connected');
});

conn.on('disconnected', function () {
    console.log('MongoDB Disconnected');
});

conn.on('error', console.error.bind(console, 'connection error:'));

module.exports = conn