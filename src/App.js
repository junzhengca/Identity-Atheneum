// @flow
const express = require('express');
const Version = require('./resources/Version');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const mongoose = require('mongoose');
const LocalIdentityProvider = require('./IdentityProvider/LocalIdentityProvider');

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

        this.app.use(session({
            store: new RedisStore({
                host: this.config.redis.host,
                port: this.config.redis.port
            }),
            resave: false,
            saveUninitialized: true,
            secret: this.config.app_secret
        }));

        mongoose.connect(this.config.mongo.url, {useNewUrlParser: true});

        // Mount all identity providers within the configuration file
        this.config.identity_providers.forEach(idp => {
            let provider;
            if(idp.type === 'local') {
                provider = new LocalIdentityProvider(idp);
            }

            if(provider) {
                provider.initialize();
                provider.mount(this.app);
            }
        });

        this.app.listen(this.config.port, () => {
            console.log("\n========================================");
            // $FlowFixMe
            console.log(` ___      ________         
|\\  \\    |\\   __  \\        
\\ \\  \\   \\ \\  \\|\\  \\       
 \\ \\  \\   \\ \\   __  \\      
  \\ \\  \\ __\\ \\  \\ \\  \\ ___    Build ${Version.buildNumber}
   \\ \\__\\\\__\\ \\__\\ \\__\\\\__\\   ${Version.versionCode}
    \\|__\\|__|\\|__|\\|__\\|__|   ${Version.versionName}
    `.bold.red)
        })
    }
}

module.exports = App;
