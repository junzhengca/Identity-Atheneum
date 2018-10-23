const IdentityProvider = require('./IdentityProvider');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../Models/User');
const express = require('express');
const getRealUrl = require('../Util/getRealUrl');

class LocalIdentityProvider extends IdentityProvider {
    initialize() {
        passport.use(new LocalStrategy((username, password, done) => {
            // Find the user
            let user;
            User.findOne({username, idp: this.config.name})
                .then(result => {
                    user = result;
                    if(user) {
                        return user.verifyPassword(password);
                    } else {
                        throw new Error("Username not found.");
                    }
                })
                .then(() => {
                    done(null, user);
                })
                .catch(e => done(null, false));
        }));

        console.log(("Local IdP " + this.config.name.bold + " initialized.").green);
    }

    mount(app) {
        const router = express.Router();

        router.get('/login', (req, res) => {
            res.render('pages/localLogin', {config: this.config, title: "Login"});
        });

        router.post('/login',
            passport.authenticate('local', {
                failureRedirect: getRealUrl('/idps/' + this.config.name + '/login'),
                failureFlash: true
            }),
            (req, res) => {
                res.redirect(getRealUrl('/login_success'));
            });

        app.use('/idps/' + this.config.name, router);

        console.log(("/idps/" + this.config.name.bold + " mounted.").green);
    }
}

module.exports = LocalIdentityProvider;
