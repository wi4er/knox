const express = require("express");
const app = express();

app.use(require("cors")({}));
app.use(require('body-parser').json());
app.use(require("./authorization"));
app.use(require("../connection").createConnection());

app.use('/storage', express.static("storage"));

app.get("/", (req, res) => {
    res.send("<h1 style='display:flex; justify-content:center; align-items:center; height:100%'>!!!KNOX!!!</h1>");
});

app.use("/file/", require("./file.js"));
app.use("/image/", require("./image.js"));
app.use("/convert/", require("./convert.js"));

app.use(require('./error'))

module.exports = app;
