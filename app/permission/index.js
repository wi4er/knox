module.exports = require('express-jwt')({
    secret: require("../../environment").SECRET,
    algorithms: ['HS256'],
    credentialsRequired: false,
});
