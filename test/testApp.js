const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const {
    ObjectID
} = require('bson');

const Scan = require('../models/scan');

app.use(bodyParser.json());

app.get('/scans', (req, res) => {
    Scan.find()
        .then((scan) => res.status(200).send(scan))
        .catch((err) => res.status(400).send(err));
});

app.post('/scans', (req, res) => {
    var body = req.body;
    const user = new ObjectID();
    const scan = Scan({
        scanname: body.scanname,
        user: user,
        url: body.url,
        ports: body.ports,
        scantype: body.scantype,
    });
    scan.save()
        .then((scan) => res.status(201).send(scan))
        .catch((err) => res.status(400).send(err));
});

module.exports = app;