const fs = require("fs");

module.exports = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
}