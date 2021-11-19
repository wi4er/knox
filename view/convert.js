const sharp = require("sharp");
const convert = require("../handling/sizeConvert");
const {Router} = require("express");
const {IMAGE} = require("../permission/entity");
const {GET} = require("../permission/method");
const router = Router();
const permissionCheck = require("../check/permissionCheck");
const Image = require("../model/Image");
const filesQuery = require("../query/filesQuery");

router.get(
    "/",
    permissionCheck(IMAGE, GET),
    (req, res, next) => {

        Image.find(
            filesQuery.parseFilter(req.query.filter)
        )
            .then(result => res.send(result))
            .catch(next);

    });


module.exports = router;

