module.exports = require('express-jwt')({
    secret: process.env.SECRET || 'hello world !',
    algorithms: ['HS256'],
    credentialsRequired: false,
});
