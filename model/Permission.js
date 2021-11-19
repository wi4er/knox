const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
    timestamp: Date,
    entity: {
        type: String,
        enum: Object.values(require("../permission/entity")),
        required: true,
    },
    method: {
        type: String,
        enum: Object.values(require("../permission/method")),
        required: true,
    },
    group: Number
});

PermissionSchema.pre("save", function(next) {
    this.timestamp = new Date();

    next();
});

module.exports = mongoose.model("permission", PermissionSchema);
