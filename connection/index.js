const mongoose = require("mongoose");

function getConnectionUrl() {
    return [
        "mongodb://",
        process.env.DB_USER || "file",
        ":",
        process.env.DB_PASSWORD || "example",
        "@",
        process.env.DB_HOST || "127.0.0.1",
        ":",
        process.env.DB_PORT || "27017",
        "/",
        process.env.DB_NAME || "file"
    ].join("");
}

module.exports = {
    connection: null,
    connect() {
        if (!this.connection) {
            return mongoose.connect(getConnectionUrl())
                .then(conn => this.connection = conn)
        } else {
            return Promise.resolve(this.connection);
        }
    },
    disconnect() {
        return this.connection?.close?.();
    },
    async clearDatabase() {
        const coll = Object.values(mongoose.connection.collections);

        for (const item of coll) {
            await item.deleteMany({});
        }
    },
    createConnection() {
        return (req, res, next) => {
            this.connect()
                .then(() => next())
                .catch(err => res.send(err.message));
        }
    },
}
