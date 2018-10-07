const IdentityProvider = require('./IdentityProvider');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const express = require('express');

class LocalIdentityProvider extends IdentityProvider {
    initialize() {
        passport.use(new LocalStrategy((username, password, done) => {
            // Find the user
            User.findOne({username, idp: this.config.name})
                .then(user => {
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
            passport.authenticate('local', { failureRedirect: '/idps/' + this.config.name + '/login', failureFlash: true }),
            (req, res) => {
                res.send("Login successful");
            });

        app.use('/idps/' + this.config.name, router);

        console.log(("/idps/" + this.config.name.bold + " mounted.").green);
    }
}

module.exports = LocalIdentityProvider;
