const {Router} = require("express");
const {IMAGE, PUBLIC} = require("../permission/entity");
const {GET} = require("../permission/method");
const router = Router();
const resolutions = require("../handling/resolutions");
const permissionCheck = require("../check/permissionCheck");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const STORAGE = require("../../environment").STORAGE_PATH;
const createFolder = require("../handling/createFolder");

router.get(
    "/:name/",
    permissionCheck([IMAGE, PUBLIC], GET),
    (req, res, next) => {
        const {params: {name}} = req;

        fs.promises.readdir(STORAGE)
            .then(files => {
                files = files.filter(f => f === name);
                res.sendFile(files[0], {root: STORAGE});
            })
            .catch(err => {
                console.log(err);
                next();
            })
    });

router.get(
    "/:type/:name/",
    permissionCheck([IMAGE, PUBLIC], GET),
    async (req, res, next) => {
        const {params: {type, name}} = req;

        fs.promises.readdir(STORAGE)
            .then(files => {
                return files.filter(f => f === name);
            })
            .then(() => {
                const [item] = resolutions.filter(i => i.type === type);
                const subDir = item.type ? STORAGE + item.type : null;

                createFolder(subDir);

                sharp(path.resolve(STORAGE, name))
                    .resize(...item?.size)
                    .toFile(path.resolve(subDir, name), () => {
                        res.download(path.resolve(subDir, name));
                    })
            })
            .catch(err => {
                console.log(err);
                next()
            });
    });

module.exports = router;

