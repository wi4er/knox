const port = process.env.PORT || 8080;
const chalk = require("chalk");

require("./view").listen(port, err => {
    if (err) {
        console.log(chalk.bgRed(err));
    } else {
        console.log(chalk.greenBright(`>>> Server starts at ${port} >>>>`));
    }
});
