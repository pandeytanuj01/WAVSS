const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create student schema & model
const ScanSchema = new Schema({
    organization: {
        type: String
    },
    url: {
        type: String,
        required: [true, 'url field is required']
    },
    scantype: {
        type: String,
        required: [true, 'scantype field is required']
    },
    reportpath: {
        type: String,
        required: [true, 'reportpath field is required']
    }
});

const Scan = mongoose.model('scan', ScanSchema);

module.exports = Scan;