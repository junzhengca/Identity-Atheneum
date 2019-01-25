import { ApolloServer } from 'apollo-server-express';
import typeDefs from './GraphQL/typeDefs';

const express = require('express');
const Version = require('./Resources/Version');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const mongoose = require('mongoose');
// $FlowFixMe
mongoose.plugin(require('./MongooseMiddlewares/findOneOrFailPlugin'));
const path = require('path');
const flash = require('connect-flash');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const LocalIdentityProvider = require('./IdentityProvider/LocalIdentityProvider');
const SamlIdentityProvider = require('./IdentityProvider/SamlIdentityProvider');
const User = require('./Models/User');
const Input = require('prompt-input');
const randStr = require('./Util/randStr');
const morgan = require('morgan');
const {
    Tracer,
    BatchRecorder,
    jsonEncoder: { JSON_V2 }
} = require('zipkin');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
const { HttpLogger } = require('zipkin-transport-http');
const CLSContext = require('zipkin-context-cls');

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(user, done) {
    User.findOne({ _id: user }, function(err, user) {
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
    server: any;

    constructor(config: mixed) {
        this.config = config;
    }

    /**
     * Get default(first) local provider
     * @returns {*}
     * @private
     */
    _getDefaultLocalProvider() {
        let provider;
        for (let i = 0; i < this.config.identity_providers.length; i++) {
            if (this.config.identity_providers[i].type === 'local') {
                provider = this.config.identity_providers[i];
            }
        }
        return provider;
    }

    /**
     * Initialize a new express app
     * @private
     */
    _initExpress() {
        this.app = express();
    }

    _initApollo() {
        this.server = new ApolloServer({
            // These will be defined for both new or existing servers
            typeDefs,
            resolvers: {}
        });
        this.server.applyMiddleware({ app: this.app });
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
        // Request logs
        this.app.use(morgan('combined'));

        this.app.use(require('./Middlewares/redirectBackMiddleware')(this));

        this.app.use(cookieParser());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());

        this.app.use(
            session({
                store: new RedisStore({
                    host: this.config.redis.host,
                    port: this.config.redis.port
                }),
                resave: false,
                saveUninitialized: true,
                secret: this.config.app_secret
            })
        );

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        this.app.use(flash());

        this.app.locals = {
            version: require('./Resources/Version'),
            config: this.config
        };

        // Mount all identity providers within the configuration file
        this.config.identity_providers.forEach(idp => {
            let provider;
            if (idp.type === 'local') {
                provider = new LocalIdentityProvider(idp);
            } else if (idp.type === 'saml') {
                // Saml requires host_root to function
                idp.host_root = this.config.host_root;
                provider = new SamlIdentityProvider(idp);
            }

            if (provider) {
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
        mongoose.connect(this.config.mongo.url, { useNewUrlParser: true });
    }

    /**
     * Bind and listen to port
     * @private
     */
    _bindPort() {
        this.app.listen(this.config.port, () => {
            console.log('\n========================================');
            // $FlowFixMe
            console.log(
                ` ___      ________         
|\\  \\    |\\   __  \\        
\\ \\  \\   \\ \\  \\|\\  \\       
 \\ \\  \\   \\ \\   __  \\      
  \\ \\  \\ __\\ \\  \\ \\  \\ ___    Build ${Version.buildNumber} [${process.env.NODE_ENV || 'dvelopment'}]
   \\ \\__\\\\__\\ \\__\\ \\__\\\\__\\   ${Version.versionCode}
    \\|__\\|__|\\|__|\\|__\\|__|   ${Version.versionName}
    `.bold.red
            );
        });
    }

    /**
     * Resolve once setup has already been done or finished
     * @returns {Promise<void>}
     * @private
     */
    _firstRunSetup(): Promise<void> {
        return new Promise((resolve, reject) => {
            let defaultProvider = this._getDefaultLocalProvider();
            if (!defaultProvider) {
                console.warn(
                    '[WARNING] Unable to find default local provider, cannot run setup, system will start without default local IdP.'
                );
                resolve();
            } else {
                let password;
                User.find({ idp: defaultProvider.name })
                    .then(users => {
                        if (users.length === 0) {
                            // Run setup
                            console.log(
                                "Seems like you don't have a user in your local provider yet, let's create one!"
                            );
                            console.warn('[WARNING] New user will have admin privilege to the system.');
                            const usernameInput = new Input({
                                name: 'username',
                                message: 'What will be the username for this user?'
                            });
                            usernameInput
                                .run()
                                .then(answer => {
                                    password = randStr(16);
                                    let username = answer;
                                    // Create a new user
                                    return User.create(defaultProvider.name, username, password, '', ['admin'], {});
                                })
                                .then(user => {
                                    console.log('Admin user created with following credentials:');
                                    console.log('* Username: ' + user.username);
                                    console.log('* Password: ' + password);
                                    resolve();
                                })
                                .catch(e => reject(e));
                        } else {
                            resolve();
                        }
                    })
                    .catch(e => reject(e));
            }
        });
    }

    _initZipkin() {
        if (this.config.zipkin) {
            const ctxImpl = new CLSContext();
            const recorder = new BatchRecorder({
                logger: new HttpLogger({
                    endpoint: this.config.zipkin.endpoint,
                    jsonEncoder: JSON_V2
                })
            });
            const localServiceName = this.config.zipkin.service_name; // name of this application
            const tracer = new Tracer({ ctxImpl, recorder, localServiceName });

            this.app.use(zipkinMiddleware({ tracer }));
            console.log('Zipkin tracing initialized...');
        }
    }

    /**
     * Start the application
     */
    run() {
        this._initExpress();
        this._initZipkin();
        this._initApollo();
        this._configureViews();
        this._mountAllRoutesAndMiddlewares();
        this._connectDatabase();

        this._firstRunSetup()
            .then(() => this._bindPort())
            .catch(e => {
                throw new Error(e);
            });
    }
}

module.exports = App;
