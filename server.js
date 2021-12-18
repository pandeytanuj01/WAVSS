const express = require('express');
const mongoose = require('./config/database');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
require('./config/passport')(passport);

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/home'));
app.use('/auth', require('./routes/authroutes'));

app.listen(process.env.port || 4000, function () {
    console.log('now listening for requests');
});