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
                console.log(err)
            })
    });

router.get(
    "/:type/:name/",
    permissionCheck([IMAGE, PUBLIC], GET),
    async (req, res, next) => {
        const {params: {type, name}} = req;

        fs.access(path.resolve(STORAGE, name), error => {
            if (!error) {
                const [item] = resolutions.filter(i => i.type === type);

                /** Check request and existing size type **/
                if (type === item?.type) {
                    const subDir = STORAGE + '/' + item?.type;

                    /** Create a subdirectory **/
                    if (!fs.existsSync(subDir)) {
                        fs.mkdirSync(subDir)
                    }

                    /** Resize file with given parameters **/

                    sharp(path.resolve(STORAGE, name))
                        .resize(200, 200)
                        .toFile(path.resolve(subDir, name), (err, info) => {
                            if (err) throw err;
                            res.download(path.resolve(subDir, name), (err) => {
                                if (err) throw err;
                            });
                        })

                } else next();
            }
        });
    });

module.exports = router;

