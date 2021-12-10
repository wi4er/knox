const multer = require("multer");
const STORAGE = require("../../environment").STORAGE_PATH;
const createFolder = require('./createFolder');
const renameFile = require('./renameItem');

const storageConfig = multer.diskStorage({
    destination: (req, file, callback, err) => {
        if (err) {
            callback(null, false)
        }

        createFolder(STORAGE);

        callback(null, STORAGE);
    },

    filename: (req, file, callback) => {
        callback(null, renameFile(file.originalname));
    }
});

const uploadFile = multer({
    storage: storageConfig,
})

module.exports = uploadFile;
