const multer = require("multer");
const env = require("../../environment");
const fs = require("fs");

const storageConfig = multer.diskStorage({
    destination: (req, file, cb, err) => {
        if (err) {
            cb(null, false);
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

const uploadFile = multer({
    storage: storageConfig
})

module.exports = uploadFile.single('file');
