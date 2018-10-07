// @flow
const fs = require('fs');

class ConfigFile {

    path: string;

    constructor(path: string) {
        this.path = path;
    }

    /**
     * Read full file content into string
     */
    read(): string {
        return fs.readFileSync(this.path, 'utf8');
    }

    /**
     * Parse the configuration
     */
    parse(): ?mixed {}
}

module.exports = ConfigFile;
