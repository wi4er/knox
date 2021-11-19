const multer = require("multer");

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
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
        return cb(new Error('Only images allowed!'));
    }
};

const uploadImage = multer({
    storage: storageConfig,
    fileFilter: imageFilter
});

module.exports = uploadImage.single('image');
