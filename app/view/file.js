const {Router} = require("express");
const router = Router();
const File = require("../model/File");
const WrongIdError = require("../exception/WrongIdError");
const {FILE, PUBLIC} = require("../permission/entity");
const {GET, POST, PUT, DELETE} = require("../permission/method");
const upload = require('../handling/uploadFile');
const filesQuery = require('../query/filesQuery')
const permissionCheck = require("../check/permissionCheck");
const cleaner = require("../cleaner/fileCleaner");

router.get(
    "/",
    permissionCheck([FILE, PUBLIC], GET),
    (req, res, next) => {
        File.find(
            filesQuery.parseFilter(req.query.filter)
        )
            .then(result => res.send(result))
            .catch(next);
    }
);

router.get(
    "/:id/",
    permissionCheck([FILE, PUBLIC], GET),
    (req, res, next) => {
        const {params: {id}} = req;

        File.findById(id)
            .then(result => {
                WrongIdError.assert(result, `Cant find file with id ${id}!`);

                res.send(result);
            })
            .catch(next);
    }
);

router.post(
    "/",
    permissionCheck([FILE, PUBLIC], POST),
    upload,
    (req, res, next) => {
        new File({
            ...req.body,
            original: req.file?.originalname,
            filename: req.file.filename,
            size: req.file?.size,
            mimetype: req.file?.mimetype,
        }).save()
            .then(result => {
                res.status(201).json(result);
            })
            .catch(next);
    }
);

router.put("/:id/",
    upload,
    permissionCheck([FILE, PUBLIC], PUT),
    (req, res, next) => {
        const {params: {id}} = req;

        File.findById(id)
            .then(result => {
                WrongIdError.assert(result, `Cant update file with id ${id}!`);

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
    permissionCheck([FILE, PUBLIC], DELETE),
    (req, res, next) => {
        const {params: {id}} = req;

        File.findById(id)
            .then(result => {
                WrongIdError.assert(result, `Cant delete file with id ${id}!`);

                cleaner.clearFile(result)

                return result.delete();
            })
            .then(() => res.send(true))
            .catch(next);
    }
);

module.exports = router;

