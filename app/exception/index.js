const {Error: {ValidationError, CastError}} = require("mongoose");
const WrongIdError = require("../exception/WrongIdError");
const PermissionError = require("../exception/PermissionError");
const FileTypeError = require("./FileTypeError");
const NotFoundError = require("./NotFoundError");

module.exports = (err, req, res, next) => {
    console.log(err.constructor);

    switch (err.constructor) {
        case ValidationError: {
            res.status(400).send(err.message);

            break;
        }

        case TypeError: {
            res.status(400).send(err.message);

            break;
        }

        case NotFoundError: {
            res.status(404).send(err.message);

            break;
        }


        case PermissionError: {
            res.status(403).send(err.message);

            break;
        }

        case WrongIdError: {
            res.status(404).send(err.message);

            break;
        }

        case CastError: {
            res.status(404).send(err.message);

            break;
        }

        case FileTypeError: {
            res.status(415).send(err.message);

            break;
        }

        default: {
            res.status(500).send(err.message);
        }
    }
}
