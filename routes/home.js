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
const {
    error
} = require('console');

function messageFlash(req, res, messageType, message, redirect = '/scan') {
    req.flash(
        messageType,
        message
    );
    res.redirect(redirect);
}

async function nmapScan(req, res, reportpath, options, ports = '') {
    var args = [];

    if (ports === 'all') {
        options.splice(options.length - 1, 0, '-p-');
    } else if (ports === 'top') {
        options.splice(options.length - 1, 0, '-F')
    } else if (ports === 'none') {} else {
        options.splice(options.length - 1, 0, `-p${ports}`);
    }

    args.push(...options);

    args.push('-vv', '-oX', `${reportpath}`, '--stylesheet=https://raw.githubusercontent.com/honze-net/nmap-bootstrap-xsl/master/nmap-bootstrap.xsl');

    var nmap = spawn('nmap', args);

    nmap.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    nmap.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    nmap.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        messageFlash(req, res, 'success_msg', 'Scan has been completed successfully.');
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
        scans: scans_array.slice(0, 5)
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
        ports,
        scantype
    } = req.body;
    const user = new ObjectID(req.user._id);
    const scan = Scan({
        scanname,
        user,
        url,
        ports,
        scantype,
    });
    dirpath = path.join(__dirname, '../');
    reportpath = dirpath + `reports/${req.user._id}-${scanname}.xml`;
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
            if (!fs.existsSync(`${dirpath}/reports/`)) {
                fs.mkdir(`${dirpath}/reports/`, (err) => {
                    if (err) {
                        return console.error(err);
                    }
                    console.log('Directory created successfully!');
                });
            }
            fs.open(reportpath, 'w', (err, fd) => {
                if (err) {
                    console.log(err);
                }
            });
            switch (scantype) {
                case 'Full Scan':
                    await nmapScan(req, res, reportpath, [
                        '-T3', '-sV', '-Pn', '--script=nmap-vulners/vulners,scipag_vulscan/vulscan', new URL(url).hostname
                    ], ports);
                    break;

                case 'Port/Service Scan':
                    await nmapScan(req, res, reportpath, [
                        '-T3', '-sV', '-Pn', new URL(url).hostname
                    ], ports);
                    break;

                case 'SQL Injection':
                    await nmapScan(req, res, reportpath, [
                        '-T3', '-sV', '-Pn', '--script=http-sql-injection', new URL(url).hostname
                    ], ports);
                    break;

                case 'CSRF Vulnerability Scan':
                    await nmapScan(req, res, reportpath, [
                        '-T3', '-sV', '-Pn', '--script=http-csrf.nse', new URL(url).hostname
                    ], ports);
                    break;
            }
            scan.reportpath = reportpath;
            scan.save();
            await User.findByIdAndUpdate(req.user._id, {
                $push: {
                    scans: [scan._id]
                }
            }).catch(err => console.log(err));
        }
    });
});

router.get('/download/:filename', ensureAuthenticated, (req, res, next) => {
    var dirpath = path.join(__dirname, '../');
    res.download(`${dirpath}/public/html/${req.params.filename}`);
});

router.get('/view/:id', ensureAuthenticated, (req, res, next) => {
    var htmlFile;
    Scan.findById(req.params.id, async (err, scan) => {
        if (err) {
            res.status(500).json({
                error: err
            });
        } else {
            console.log(scan);
            var dirpath = path.join(__dirname, '../');
            htmlFile = `${req.user._id}-${scan.scanname}.html`;
            if (!fs.existsSync(`${dirpath}/public/html/`)) {
                fs.mkdir(`${dirpath}/public/html/`, (err) => {
                    if (err) {
                        return console.error(err);
                    }
                    console.log('Directory created successfully!');
                });
            }
            exec(`xsltproc -o ${dirpath}public/html/${htmlFile} ${dirpath}public/xsl/nmap-bootstrap.xsl ${dirpath + scan.reportpath.split('/').at(-2)+ '/' + scan.reportpath.split('/').at(-1)}`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    messageFlash(req, res, 'error_msg', 'An Error Occurred. Please try again later.', '/analysis');
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                res.render('scanfile', {
                    title: scan.scanname,
                    file: htmlFile,
                    user: req.user,
                });
            });
        }
    });
});

// delete a scan in the database
router.get('/delete/:id', ensureAuthenticated, (req, res, next) => {
    try {
        Scan.findOneAndDelete({
            _id: req.params.id
        }).then(async (scan) => {
            var dirpath = path.join(__dirname, '../');
            htmlFile = `${req.user._id}-${scan.scanname}.html`;
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
            fs.unlink(`${dirpath}/public/html/${htmlFile}`, (err) => {
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