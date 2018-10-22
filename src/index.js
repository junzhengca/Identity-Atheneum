// @flow
const App = require('./App');
// $FlowFixMe
const colors = require('colors');

// First read the configuration file

const config = require('./config');

// console.log(config);

// Run the app
const app = new App(config);
app.run();
