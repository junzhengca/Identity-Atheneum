const IdentityProvider = require('./IdentityProvider');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const express = require('express');
const fs = require('fs');

class SamlIdentityProvider extends IdentityProvider {
    initialize() {

        this.strategy = new SamlStrategy(
            {
                callbackUrl: this.config.host_root + "/idps/" + this.config.name + "/login",
                entryPoint: this.config.config.entry_point,
                issuer: this.config.config.issuer,
                signatureAlgorithm: this.config.config.signature_algo,
                // TODO: Validate signature of the IdP
                // cert: fs.readFileSync(this.config.config.cert, 'utf8'),
                privateCert: fs.readFileSync(this.config.config.private_key, 'utf8'),
                decryptionPvk: fs.readFileSync(this.config.config.private_key, 'utf8'),
                identifierFormat: this.config.config.identifier_format
            },
            (profile, done) => {
                console.log(profile);
                done(null, false);
            }
        );

        passport.use(this.strategy);

        console.log(("SAML IdP " + this.config.name.bold + " initialized.").green);
    }

    mount(app) {
        const router = express.Router();

        router.get('/login',
            passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
            function (req, res) {
                res.redirect('/');
            }
        );

        router.get('/metadata', (req, res) => {
            res.setHeader('content-type', 'application/xml');
            res.send(this.strategy.generateServiceProviderMetadata(fs.readFileSync(this.config.config.public_cert, 'utf8')));
        });


        router.post('/login',
            passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
            function(req, res) {
                res.send("Login successful");
            }
        );

        app.use('/idps/' + this.config.name, router);

        console.log(("/idps/" + this.config.name.bold + " mounted.").green);
    }
}

module.exports = SamlIdentityProvider;
