const YamlConfigFile = require('./ConfigFile/YamlConfigFile');
const MutedError = require('./Errors/MutedError');

const configFile = new YamlConfigFile("config.yml");
const config = configFile.parse();


const validationResult = configFile.validate();

if(validationResult.errors.length > 0) {
    console.error("System detected one or more configuration errors:");
    validationResult.errors.forEach(str => console.error("* " + str));
    throw new MutedError("Fatal configuration error. Failed to validate configuration file config.yml. Please read error messages above.");
}

console.log("Configuration validated.");

module.exports = config;