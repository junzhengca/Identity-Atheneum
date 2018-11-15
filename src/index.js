// @flow
/*-------------------------------------
 * Application entry point, initializes
 * new App instance.
 *
 * Author(s): Jun Zheng
 --------------------------------------*/

const App = require('./App');
// $FlowFixMe
const colors = require('colors');

// First read the configuration file
const config = require('./config');

process.on('SIGINT', function() {
    console.log('Interrupted');
    process.exit();
});

// Run the app
const app = new App(config);
app.run();


