const YamlConfigFile = require('./ConfigFile/YamlConfigFile');


const configFile = new YamlConfigFile("config.yml");
const config = configFile.parse();

module.exports = config;