const multer = require("multer");
const env = require("../../environment");
const fs = require("fs");
const FileTypeError = require("../exception/FileTypeError");

const storageConfig = multer.diskStorage({
    destination: (req, file, cb, err) => {
        if(err) {
            cb(null, false)
        }
        if (!fs.existsSync(env.STORAGE_PATH)) {
            fs.mkdirSync(env.STORAGE_PATH);
        }
        cb(null, env.STORAGE_PATH);
    },
    filename: (req, file, cb) => {
        cb(null, `${new Date().getTime()}_${file.originalname.split(' ').join('_')}`);
    }
});

const imageFilter = (req, file, cb) => {
    if (file.mimetype.includes('image')) {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new FileTypeError("Only images allowed!"));
    }
};

const uploadImage = multer({
    storage: storageConfig,
    fileFilter: imageFilter
});

module.exports = uploadImage.single('image');
