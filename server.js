const express = require('express');
// const expressLayouts = require('express-ejs-layouts');
const mongoose = require('./config/database');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
require('./config/passport')(passport);

const app = express();

// app.use(expressLayouts);

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

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

// app.post('/api/change-password', async (req, res) => {
//     const { token, newpassword: plainTextPassword } = req.body;

//     if (!plainTextPassword || typeof plainTextPassword !== 'string') {
//         return res.json({ status: 'error', error: 'Invalid password' });
//     }

//     if (plainTextPassword.length < 5) {
//         return res.json({
//             status: 'error',
//             error: 'Password too small. Should be atleast 6 characters'
//         });
//     }

//     try {
//         const user = jwt.verify(token, JWT_SECRET);

//         const _id = user.id;

//         const password = await bcrypt.hash(plainTextPassword, 10);

//         await User.updateOne(
//             { _id },
//             {
//                 $set: { password }
//             }
//         )
//         res.json({ status: 'ok' });
//     } catch (error) {
//         console.log(error);
//         res.json({ status: 'error', error: ';))' });
//     }
// })
// 
// app.get('/api', (req, res) => {
//     exec('nmap -h', (err, stdout, stderr) => {
//         if (err) {
//             console.log("node couldn't execute the command");
//             return;
//         }
//         console.log(`stdout: ${stdout}`);
//     });
//     res.send('Its working!');
// });

app.listen(process.env.port || 4000, function () {
    console.log('now listening for requests');
});