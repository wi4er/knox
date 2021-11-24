const convert = require("../handling/resolutions");
const sharp = require("sharp");
const {Router} = require("express");
const {IMAGE, PUBLIC} = require("../permission/entity");
const {GET} = require("../permission/method");
const router = Router();
const permissionCheck = require("../check/permissionCheck");
const Image = require("../model/Image");
const filesQuery = require("../query/filesQuery");
const WrongIdError = require("../exception/WrongIdError");

router.get(
    "/",
    permissionCheck([IMAGE, PUBLIC], GET),
    (req, res, next) => {

        Image.find(
            filesQuery.parseFilter(req.query.filter)
        )
            .then(result => res.send(result))
            .catch(next);

    });

router.get(
    "/:name/:id",
    permissionCheck([IMAGE, PUBLIC], GET),
    (req, res, next) => {
        const {params: {name, id}} = req;
        const [item] = convert.filter(u => u.name === name);

        Image.findById(id)
            .then(result => {
                WrongIdError.assert(result, `Cant find file with id ${id}!`);

                res.send(item.size);
            })
            .catch(next);
    })

module.exports = router;

