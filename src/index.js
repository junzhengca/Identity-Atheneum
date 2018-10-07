// @flow
const YamlConfigFile = require('./ConfigFile/YamlConfigFile');
const App = require('./App');

// First read the configuration file

const configFile = new YamlConfigFile("config.yml");
const config = configFile.parse();

// Run the app
const app = new App(config);
app.run();
