module.exports = class KnoxError extends Error {
    static assert(value, message) {
        if (!value) {
            throw new this(message);
        }
    }
}
