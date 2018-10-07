// @flow
const express = require('express');
const StdIOStreamLogger = require('./Logger/StdIOStreamLogger');
const Version = require('./Resources/Version');

/**
 * The primary class used to run the app
 */
class App<Number> {

    // $FlowFixMe
    config: mixed;
    app: express$Application;

    constructor(config: mixed) {
        this.config = config;
    }

    /**
     * Start the application
     */
    run() {
        this.app = express();

        this.app.listen(this.config.port, () => {
            StdIOStreamLogger.write("Identity Atheneum started on port", this.config.port.toString());
            StdIOStreamLogger.write(Version.versionName, Version.versionCode, "Build", Version.buildNumber);
        })
    }
}

module.exports = App;
