// @flow
const Logger = require('./Logger');

class StdIOStreamLogger extends Logger {
    /**
     * Takes in a list of strings, print them to stdout, separated by one space.
     * @param messages
     */
    static write(...messages: string[]) {
        let result: string = "";
        messages.forEach(message => {
            result += message + " ";
        });
        console.log(result);
    }
}

module.exports = StdIOStreamLogger;
