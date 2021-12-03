const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    timestamp: Date,
    original: String,
    filename: String,
    size: String,
    mimetype: String,
});

FileSchema.pre("save", function (next) {
    this.timestamp = new Date();

    next();
});

module.exports = mongoose.model('file', FileSchema);
