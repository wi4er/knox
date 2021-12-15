const fs = require("fs");

module.exports = (directory) => {
    if (!fs.existsSync(directory) && directory) {
        fs.mkdirSync(directory);
    }
}