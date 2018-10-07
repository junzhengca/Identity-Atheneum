const IdentityProvider = require('./IdentityProvider');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

class LocalIdentityProvider extends IdentityProvider {
    initialize() {
        passport.use(new LocalStrategy((username, password, done) => {

        }));

        console.log(("Local IdP " + this.config.name.bold + " initialized.").green);
    }

    mount(app) {

        console.log(("/idps/" + this.config.name.bold + " mounted.").green);
    }
}

module.exports = LocalIdentityProvider;
