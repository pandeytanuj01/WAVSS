const express = require("express")
const mongoose = require('mongoose');
const { exec } = require('child_process');

const app = express();

app.get('/api', (req, res) => {
    exec('nmap -h', (err, stdout, stderr) => {
        if (err) {
            console.log("node couldn't execute the command");
            return;
        }

        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
    });
    res.send('Its working!');
});

app.listen(process.env.port || 4000, function () {
    console.log('now listening for requests');
});
