// @flow
const ConfigFile = require('./ConfigFile');
const yaml = require('js-yaml');

/**
 * Configuration file described using YAML
 */
class YamlConfigFile extends ConfigFile {
    parse(): ?mixed {
        let source: string = this.read();
        try {
            return yaml.safeLoad(source);
        } catch (e) {
            throw new Error(e);
        }
    }
}

module.exports = YamlConfigFile;
