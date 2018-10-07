// @flow
const YamlConfigFile = require('./ConfigFile/YamlConfigFile');
const App = require('./App');
// $FlowFixMe
const colors = require('colors');

// First read the configuration file

const configFile = new YamlConfigFile("config.yml");
const config = configFile.parse();

// console.log(config);

// Run the app
const app = new App(config);
app.run();
