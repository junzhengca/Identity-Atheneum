module.exports = class NotFoundError extends Error {

    constructor(msg) {
        super(msg);
        this.stack = [];
    }

};