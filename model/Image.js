const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    timestamp: Date,
    original: String,
    path: {
        type: String,
        required: true
    },
    size: String,
    mimetype: String,
});

ImageSchema.pre("save", function (next) {
    this.timestamp = new Date();

    next();
});

module.exports = mongoose.model('image', ImageSchema);
