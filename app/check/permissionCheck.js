const Permission = require("../model/Permission");
const PermissionError = require("../exception/PermissionError");

module.exports = (entity, method) => (req, res, next) => {
    Permission.findOne({
        entity,
        method,
        group: {$in: req.user?.group},
    })
        .then(row => {

            if (!row && !req.user?.admin) {
                next(new PermissionError("Permission denied!"));
            }

            next();
        })
        .catch(next);
}
