// @flow
const express = require('express');
const Version = require('./Resources/Version');
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
const User = require('./Models/User');

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(user, done) {
    User.findOne({_id: user}, function(err, user) {
        done(err, user);
    });
});

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
     * Initialize a new express app
     * @private
     */
    _initExpress() {
        this.app = express();
    }

    /**
     * Configure views directory
     * @private
     */
    _configureViews() {
        this.app.set('views', path.join(__dirname, '/Views'));
        this.app.set('view engine', 'ejs');
    }

    /**
     * Mount all routes and middlewares for the application
     * @private
     */
    _mountAllRoutesAndMiddlewares() {
        this.app.use(cookieParser());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());

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

        this.app.use(require('./Middlewares/masterAuthMiddleware')(this));

        // Mount web Routes
        require('./Routes/web')(this);

        // Mount API Routes
        require('./Routes/api')(this);
    }

    /**
     * Connect to database
     * @private
     */
    _connectDatabase() {
        mongoose.connect(this.config.mongo.url, {useNewUrlParser: true});
    }

    /**
     * Bind and listen to port
     * @private
     */
    _bindPort() {
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

    /**
     * Start the application
     */
    run() {
        this._initExpress();
        this._configureViews();
        this._mountAllRoutesAndMiddlewares();
        this._connectDatabase();

        this._bindPort();
    }
}

module.exports = App;
