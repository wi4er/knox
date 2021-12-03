const fs = require("fs");
const path = require("path");
const STORAGE = require("../../environment").STORAGE_PATH;

module.exports = {
    clearAllFiles(directory) {

        fs.readdir(directory, ((err, files) => {
            if (err) throw err;

            for (const file of files) {
                let filePath = directory + '/' + file;
                /** Delete files **/
                if (fs.statSync(filePath).isFile()) {
                    fs.unlink(path.join(directory, file), err => {
                        if (err) {
                            throw err;
                        }
                        return true;
                    });
                } else {
                    /** Delete subdirectories **/
                    fs.rmSync(filePath, {recursive: true});
                }
            }
        }));
    },

    clearFile(res) {
        /** Delete one file from disk. Use for PUT and DELETE **/
        fs.unlink(path.resolve(STORAGE, res.filename), err => {
            if (err) {
                throw err;
            } else {
                return true;
            }
        });
    }
}

