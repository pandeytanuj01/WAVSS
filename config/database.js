const mongoose = require('mongoose');
const DB_URI = 'mongodb+srv://admin:admin123@wavss-cluster.xco7y.mongodb.net/WAVSS?retryWrites=true&w=majority';

function connect() {
    return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV === 'test') {
            const Mockgoose = require('mockgoose').Mockgoose;
            const mockgoose = new Mockgoose(mongoose);

            mockgoose.prepareStorage()
                .then(() => {
                    mongoose.connect(DB_URI, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                    }).then((res, err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });

        } else {

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

        }
    });
}


function close() {
    return mongoose.disconnect();
}

module.exports = {
    connect,
    close
};