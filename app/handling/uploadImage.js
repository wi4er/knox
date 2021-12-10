const multer = require("multer");
const STORAGE = require("../../environment").STORAGE_PATH;
const FileTypeError = require("../exception/FileTypeError");
const createFolder = require('./createFolder');
const renameImage = require('./renameItem');

const storageConfig = multer.diskStorage({
    destination: (req, file, callback, err) => {
        if (err) {
            callback(null, false)
        }

        createFolder(STORAGE)

        callback(null, STORAGE);
    },

    filename: (req, file, callback) => {
        callback(null, renameImage(file.originalname));
    }
});

const imageFilter = (req, file, callback) => {
    if (file.mimetype.includes('image')) {
        callback(null, true);
    } else {
        callback(null, false);
        return callback(new FileTypeError("Only images allowed!"));
    }
};

const uploadImage = multer({
    storage: storageConfig,
    fileFilter: imageFilter,
});

module.exports = uploadImage;
