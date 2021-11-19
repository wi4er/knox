const jwt = require("jsonwebtoken");

module.exports = [
    "authorization",
    `Bearer ${jwt.sign(
        {id: "000122333444455555666666", admin: true},
        "hello world !",
        { algorithm: 'HS256'}
    )}`
];
