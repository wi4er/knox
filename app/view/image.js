const {Router} = require("express");
const router = Router();
const Image = require("../model/Image");
const WrongIdError = require("../exception/WrongIdError");
const {IMAGE, PUBLIC} = require("../permission/entity");
const {GET, POST, PUT, DELETE} = require("../permission/method");
const upload = require('../handling/uploadImage');
const filesQuery = require('../query/filesQuery')
const permissionCheck = require("../check/permissionCheck");
const cleaner = require("../cleaner/fileCleaner");

router.get(
    "/",
    permissionCheck([IMAGE, PUBLIC], GET),
    (req, res, next) => {
        Image.find(
            filesQuery.parseFilter(req.query.filter)
        )
            .then(result => res.send(result))
            .catch(next);
    }
);

router.get(
    "/:id/",
    permissionCheck([IMAGE, PUBLIC], GET),
    (req, res, next) => {
        const {params: {id}} = req;

        Image.findById(id)
            .then(result => {
                WrongIdError.assert(result, `Cant find file with id ${id}!`);

                res.send(result);
            })
            .catch(next);
    }
);

router.post(
    "/",
    permissionCheck([IMAGE, PUBLIC], POST),
    upload,
    (req, res, next) => {
        new Image({
            ...req.body,
            original: req.file?.originalname,
            filename: req.file.filename,
            size: req.file?.size,
            mimetype: req.file?.mimetype,
        }).save()
            .then(result => {
                res
                    .status(201)
                    .json(result);
            })
            .catch(next);
    }
);

router.put("/:id/",
    upload,
    permissionCheck([IMAGE, PUBLIC], PUT),
    (req, res, next) => {
        const {params: {id}} = req;

        Image.findById(id)
            .then(result => {
                WrongIdError.assert(result, `Cant update image with id ${id}!`);

                cleaner.clearFile(result);

                return Object.assign(result, {
                    ...req.body,
                    original: req.file?.originalname,
                    filename: req.file.filename,
                    size: req.file?.size,
                    mimetype: req.file?.mimetype,
                }).save();
            })
            .then(saved => res.send(saved))
            .catch(next);
    }
);

router.delete(
    "/:id/",
    permissionCheck([IMAGE, PUBLIC], DELETE),
    (req, res, next) => {
        const {params: {id}} = req;

        Image.findById(id)
            .then(result => {
                WrongIdError.assert(result, `Cant delete image with id ${id}!`);

                cleaner.clearFile(result)

                return result.delete();
            })
            .then(() => res.send(true))
            .catch(next);
    }
);

module.exports = router;

