const express = require("express");
const app = express();
const STORAGE = require("../environment").STORAGE_PATH;

app.use(require("cors")({}));
app.use(require('body-parser').json());
app.use(require("./permission"));
app.use(require("./model"));

app.get("/", (req, res) => {
    res.send("<h1 style='display:flex; justify-content:center; align-items:center; height:100%'>!!!KNOX!!!</h1>");
});

app.use("/file/", require("./view/file"));
app.use("/image/", require("./view/image"));
app.use("/upload/", require("./view/upload"));

app.use(require('./exception'))

module.exports = app;
