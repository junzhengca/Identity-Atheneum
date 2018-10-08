// @flow
const express = require('express');
const Version = require('./resources/Version');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const LocalIdentityProvider = require('./IdentityProvider/LocalIdentityProvider');
const SamlIdentityProvider = require('./IdentityProvider/SamlIdentityProvider');

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

        this.app.set('views', path.join(__dirname, '/views'));
        this.app.set('view engine', 'ejs');

        this.app.use(cookieParser());
        this.app.use(bodyParser.urlencoded({ extended: false }));

        this.app.use(session({
            store: new RedisStore({
                host: this.config.redis.host,
                port: this.config.redis.port
            }),
            resave: false,
            saveUninitialized: true,
            secret: this.config.app_secret
        }));

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        this.app.use(flash());

        // Mount all identity providers within the configuration file
        this.config.identity_providers.forEach(idp => {
            let provider;
            if(idp.type === 'local') {
                provider = new LocalIdentityProvider(idp);
            } else if(idp.type === 'saml') {
                // Saml requires host_root to function
                idp.host_root = this.config.host_root;
                provider = new SamlIdentityProvider(idp);
            }

            if(provider) {
                provider.initialize();
                provider.mount(this.app);
            }
        });

        mongoose.connect(this.config.mongo.url, {useNewUrlParser: true});
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
