const multer = require("multer");
const path = require("path");

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.STORAGE_PATH || "app/storage/files");
    },
    filename: (req, file, cb) => {
        cb(null, `${new Date().getTime()}_${file.originalname.split(' ').join('_')}`);
    }
});

const uploadFile = multer({
    storage: storageConfig
})

module.exports = uploadFile.single('file');
