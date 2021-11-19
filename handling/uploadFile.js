const multer = require("multer");

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "storage");
    },
    filename: (req, file, cb) => {
        cb(null, `${new Date().getTime()}.${file.originalname.split('.').pop()}`);
    }
});

const uploadFile = multer({
    storage: storageConfig
})

module.exports = uploadFile.single('file');
