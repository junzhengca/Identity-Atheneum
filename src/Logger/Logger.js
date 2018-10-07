// @flow

class Logger {
    static write(...messages: string[]) {
        throw new Error("Logger is an abstract class, write() method must be implemented.")
    }
}

module.exports = Logger;
