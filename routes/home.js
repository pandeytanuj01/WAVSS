const express = require('express');
const router = express.Router();
const Scan = require('../models/scan');
const fs = require('fs');
const {
    ensureAuthenticated,
    forwardAuthenticated
} = require('../config/auth');
const {
    exec,
    spawn
} = require('child_process');
const path = require('path');
const User = require('../models/user');
const {
    ObjectID
} = require('bson');

function messageFlash(req, res, messageType, message, redirect = '/scan') {
    req.flash(
        messageType,
        message
    );
    res.redirect(redirect);
}

function nmapScan(reportpath, options) {

    var nmap = spawn('nmap', [options['1'], '-oX', `${reportpath}`, '--stylesheet=https://raw.githubusercontent.com/honze-net/nmap-bootstrap-xsl/master/nmap-bootstrap.xsl', options['url']]);

    nmap.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    nmap.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    nmap.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('index', {
    url: req.path
}));

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    var scans_array = await getScans(req);
    res.render('dashboard', {
        title: 'Dashboard',
        user: req.user,
        scans: scans_array
    });
});

// get a list of scans from the database
router.get('/scan', ensureAuthenticated, (req, res, next) =>
    res.render('scan', {
        title: 'Scan',
        user: req.user
    })
);

async function getScans(req) {
    var scans_array = [];
    await User.findById(req.user._id).populate('scans').then(user => {
        scans_array = scans_array.concat(user['scans']);
    });
    return scans_array;
}

// get a list of scans from the database
router.get('/analysis', ensureAuthenticated, async (req, res, next) => {
    var scans_array = await getScans(req);
    res.render('analysis', {
        title: 'Analysis',
        user: req.user,
        scans: scans_array,
    });
});

// add a new scan to database
router.post('/scan', ensureAuthenticated, (req, res, next) => {
    const {
        scanname,
        url,
        scantype
    } = req.body;
    const user = new ObjectID(req.user._id);
    const scan = Scan({
        scanname,
        user,
        url,
        scantype,
    });
    dirpath = path.join(__dirname, '../');
    reportpath = dirpath + `/reports/${req.user._id}-${scanname}.xml`;
    Scan.findOne({
        reportpath: reportpath
    }, async (err, doc) => {
        if (err) {
            res.status(500).json({
                error: err
            });
        } else if (doc) {
            messageFlash(req, res, 'error_msg', 'Scan Already Exists. Please use a different Scan Name.');
        } else {
            fs.open(reportpath, 'w', (err, fd) => {
                if (err) {
                    console.log(err);
                }
            });
            switch (scantype) {
                case 'Full Scan':
                    nmapScan(reportpath, {
                        '1': '-vv',
                        'url': new URL(url).hostname
                    });
                    break;

                case 'Port/Service Scan':
                    exec(`nmap -oX ${reportpath} --stylesheet=https://raw.githubusercontent.com/honze-net/nmap-bootstrap-xsl/master/nmap-bootstrap.xsl niituniversity.in`, (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return;
                        }
                        console.log(`stdout: ${stdout}`);
                    });
                    break;

                case 'SQL Injection':
                    exec(`nmap -oX ${reportpath} --stylesheet=https://raw.githubusercontent.com/honze-net/nmap-bootstrap-xsl/master/nmap-bootstrap.xsl niituniversity.in`, (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return;
                        }
                        console.log(`stdout: ${stdout}`);
                    });
                    break;

                case 'CSRF Vulnerability Scan':
                    exec(`nmap -oX ${reportpath} --stylesheet=https://raw.githubusercontent.com/honze-net/nmap-bootstrap-xsl/master/nmap-bootstrap.xsl niituniversity.in`, (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return;
                        }
                        console.log(`stdout: ${stdout}`);
                    });
                    break;
            }
            scan.reportpath = reportpath;
            scan.save();
            await User.findByIdAndUpdate(req.user._id, {
                $push: {
                    scans: [scan._id]
                }
            }).catch(err => console.log(err));
            messageFlash(req, res, 'success_msg', 'Scan has been completed successfully.');
        }
    });
});

// delete a scan in the database
router.get('/delete/:id', ensureAuthenticated, (req, res, next) => {
    try {
        Scan.findOneAndDelete({
            _id: req.params.id
        }).then(async (scan) => {
            await User.findByIdAndUpdate(req.user._id, {
                $pull: {
                    scans: scan._id 
                }
            });
            fs.unlink(scan.reportpath, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            messageFlash(req, res, 'success_msg', 'Scan deleted Successfully.', '/analysis');
        });
    } catch (error) {
        messageFlash(req, res, 'error_msg', 'Scan could not be Deleted.', '/analysis')
    }
});

module.exports = router;