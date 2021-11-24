const port = process.env.PORT || 8081;
const chalk = require("chalk");

require("./app").listen(port, err => {
    if (err) {
        console.log(chalk.bgRed(err));
    } else {
        console.log(chalk.greenBright(`>>> Server starts at ${port} >>>>`));
    }
});
