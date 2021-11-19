const fs = require("fs");
const path = require("path");

module.exports = {
    clearAllFiles(directory) {

        fs.readdir(directory, ((err, files) => {
            if (err) {
                throw err;
            }

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) {
                        throw err;
                    }
                    return true;
                });
            }
        }));
    },

    clearFile(res) {
        fs.unlink(`./${res.path}`, err => {
            if (err) {
                throw err;
            } else {
                return true;
            }
        });
    }
}

