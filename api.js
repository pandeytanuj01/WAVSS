const express = require('express');
const router = express.Router();
const Scan = require('../models/scan');

// get a list of students from the database
router.get('/scan',function(req,res,next){
    Scan.find({}).then(function(scans){
        res.send(scans);
    }).catch(next);
});

// add a new student to database
router.post('/scan',function(req,res,next){
    Scan.create(req.body).then(function(scan){
        res.send(scan);
    }).catch(next);
});

// delete a student in the database
router.delete('/scan/:id',function(req,res,next){
    Scan.findOneAndDelete({_id: req.params.id}).then(function(scan){
        res.send(scan);
    });
});

module.exports = router;