const mongoose = require("mongoose");

class Model {
    connection = null;

    constructor() {
        const res = this.createConnection.bind(this)
        res.disconnect = this.disconnect.bind(this);
        res.connect = this.connect.bind(this);
        res.clearDatabase = this.clearDatabase.bind(this);

        return res;
    }

    getConnectionUrl() {
        if (process.env.DB_URL) {
            return process.env.DB_URL;
        }

        return [
            "mongodb://",
            process.env.DB_USER || "knox",
            ":",
            process.env.DB_PASSWORD || "example",
            "@",
            process.env.DB_HOST || "127.0.0.1",
            ":",
            process.env.DB_PORT || "27017",
            "/",
            process.env.DB_NAME || "knox"
        ].join("");
    }

    getConnectionOptions() {
        const options = {};

        if (process.env.USE_SSL) {
            options.ssl = true;
            options.sslCA = process.env.USE_SSL;
        }

        return options;
    }

    connect() {
        if (!this.connection) {
            return mongoose.connect(this.getConnectionUrl(), this.getConnectionOptions())
                .then(conn => this.connection = conn)

        } else {
            return Promise.resolve(this.connection);
        }
    }

    disconnect() {
        return this.connection?.close?.();
    }

    async clearDatabase() {
        const coll = Object.values(mongoose.connection.collections);

        for (const item of coll) {
            await item.deleteMany({});
        }
    }

    createConnection(req, res, next) {
        this.connect()
            .then(() => next())
            .catch(err => next(err));
    }
}

module.exports = new Model();
