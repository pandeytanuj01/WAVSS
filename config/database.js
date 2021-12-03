var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/WAVSS', { useNewUrlParser: true, useUnifiedTopology: true });

var conn = mongoose.connection;

conn.on('connected', function () {
    console.log('MongoDB Connected');
});

conn.on('disconnected', function () {
    console.log('MongoDB Disconnected');
});

conn.on('error', console.error.bind(console, 'connection error:'));

module.exports = conn;