const express = require('express');
const router = express.Router();
const Scan = require('../models/scan');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('index'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

// get a list of scans from the database
router.get('/scan', function (req, res, next) {
    Scan.find({}).then(function (scans) {
        res.send(scans);
    }).catch(next);
});

// add a new scan to database
router.post('/scan', function (req, res, next) {
    Scan.create(req.body).then(function (scan) {
        res.send(scan);
    }).catch(next);
});

// delete a scan in the database
router.delete('/scan/:id', function (req, res, next) {
    Scan.findOneAndDelete({ _id: req.params.id }).then(function (scan) {
        res.send(scan);
    });
});

module.exports = router;