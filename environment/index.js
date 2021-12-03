const process = require("process");

class Environment {
    get PORT() {
        return process.env.PORT || 8081;
    }

    get DB_USER() {
        return process.env.DB_USER || "knox";
    }

    get DB_PASSWORD() {
        return process.env.DB_PASSWORD || "example";
    }

    get DB_HOST() {
        return process.env.DB_HOST || "127.0.0.1";
    }

    get DB_PORT() {
        return process.env.DB_PORT || "27017";
    }

    get DB_NAME() {
        return process.env.DB_NAME || "knox";
    }

    get DB_URL() {
        return process.env.DB_URL;
    }

    get USE_SSL() {
        return process.env.USE_SSL;
    }

    get STORAGE_PATH() {
        return process.env.STORAGE_PATH || "app/storage/";
    }

    get SECRET() {
        return process.env.SECRET || 'hello world !';
    }
}

module.exports = new Environment();
