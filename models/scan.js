const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ScanSchema = Schema({
    scanname: {
        type: String,
        required: [true, 'scanname field is required']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    url: {
        type: String,
        required: [true, 'url field is required']
    },
    ports: {
        type: String,
        required: [true, 'port field is required']
    },
    scantype: {
        type: String,
        required: [true, 'scantype field is required']
    },
    reportpath: String,
}, {
    timestamps: true,
});

const Scan = mongoose.model('scan', ScanSchema);

module.exports = Scan;