module.exports = class MutedError extends Error {

    constructor(msg) {
        super(msg);
        this.stack = [];
    }

};