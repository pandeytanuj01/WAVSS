const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = Schema({
    name: {
        type: String,
        required: [true, 'email field is required'],
    },
    email: {
        type: String,
        required: [true, 'email field is required'],
        unique : true
    },
    username: {
        type: String,
        required: [true, 'username field is required'],
        unique : true
    },
    password: {
        type: String,
        required: [true, 'password field is required']
    }
});
const User = mongoose.model('user', UserSchema);

module.exports = User;