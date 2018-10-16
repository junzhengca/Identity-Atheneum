const IdentityProvider = require('./IdentityProvider');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const express = require('express');
const fs = require('fs');
const User = require('../models/User');
const sanitizeKeysForMongo = require('../util/sanitizeKeysForMongo');

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
                cert: "MIIE9zCCA9+gAwIBAgIJAIV1yBiJ3t2eMA0GCSqGSIb3DQEBCwUAMIGtMQswCQYDVQQGEwJDQTEQMA4GA1UECBMHT250YXJpbzEQMA4GA1UEBxMHVG9yb250bzEeMBwGA1UEChMVVW5pdmVyc2l0eSBvZiBUb3JvbnRvMSwwKgYDVQQLEyNJbmZvcm1hdGlvbiBhbmQgVGVjaG5vbG9neSBTZXJ2aWNlczEsMCoGA1UEAxMjVVRPUmF1dGggU0FNTCBNZXRhZGF0YSBWZXJpZmljYXRpb24wHhcNMTIwMjE2MTgzMTQ1WhcNMzIwMjExMTgzMTQ1WjCBrTELMAkGA1UEBhMCQ0ExEDAOBgNVBAgTB09udGFyaW8xEDAOBgNVBAcTB1Rvcm9udG8xHjAcBgNVBAoTFVVuaXZlcnNpdHkgb2YgVG9yb250bzEsMCoGA1UECxMjSW5mb3JtYXRpb24gYW5kIFRlY2hub2xvZ3kgU2VydmljZXMxLDAqBgNVBAMTI1VUT1JhdXRoIFNBTUwgTWV0YWRhdGEgVmVyaWZpY2F0aW9uMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwT0WOAnibkG9oXky5+R3lvvsSQfpg35FdO2bV+o8ig4cl3yVLKmvEvn3vCHPhxRkXn9fBId3gNdGh3h/gh0+rJzmYepJK85dpkv/luXxhH7i+D8Zkdo8VpzKYUtmFIhAGNL4HCgWujOPTorM7C1WSgI+rCwJHcOXzqqOeHsYV0njOWzeZA6LpD6AdmgoLmBoYJgkS/OeGWnRHm2pyZ+I+Zdhrl0SAESHDRDNTuxnH7IpGQFrWONL03P7W8vb+LYB5KIQ89uLSwXw4Enkm1dTg2bCY/J68OxO7UfkD/vl7eMy+U9xgparwPWjki3SroW+Nyy5nNagLcdbYKjzyMzZKQIDAQABo4IBFjCCARIwHQYDVR0OBBYEFMzi/Z2BjknKpEPWAYV1VFFe+KfdMIHiBgNVHSMEgdowgdeAFMzi/Z2BjknKpEPWAYV1VFFe+KfdoYGzpIGwMIGtMQswCQYDVQQGEwJDQTEQMA4GA1UECBMHT250YXJpbzEQMA4GA1UEBxMHVG9yb250bzEeMBwGA1UEChMVVW5pdmVyc2l0eSBvZiBUb3JvbnRvMSwwKgYDVQQLEyNJbmZvcm1hdGlvbiBhbmQgVGVjaG5vbG9neSBTZXJ2aWNlczEsMCoGA1UEAxMjVVRPUmF1dGggU0FNTCBNZXRhZGF0YSBWZXJpZmljYXRpb26CCQCFdcgYid7dnjAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQAOr4EuSjpSK89/8TL7TXFn8aOzQi+SdxdwqJbce/zMttTTLg3K0uIKwLIJXVhB4izDbusNR0jndH9suBCR81wYYRogVJasT8y/Raq3LOYYNot5CojY9MrJqVVEoTEwKyq6zJUHwScPz94c6SPsjLRtvaEPfJktHUf/9JgVTZtuUj4oIkp5YtK1vmVOCuSSyOk+Ds5Xw5tbK3Y+++2hnSzSNPE32TXIuhN2Xy+oSZb1i7LoZjWXhpxnQd4Bk+uJX4ls4q4cfip4JXxKqUAXk5g+J1S/yVXztwXrZrYHaI5way/21jLQNR3mgmOLJIU1r6g0Mea4+cQpjnjHihZuiSyc",
                privateCert: fs.readFileSync(this.config.config.private_key, 'utf8'),
                decryptionPvk: fs.readFileSync(this.config.config.private_key, 'utf8'),
                identifierFormat: this.config.config.identifier_format,
                acceptedClockSkewMs: 180
            },
            (profile, done) => {
                // Ensure a user with nameID exist within the database
                User.findOne({ username: profile.nameID, idp: this.config.name })
                    .then(user => {
                        if(user) {
                            done(null, user);
                        } else {
                            // Otherwise we create the user
                            console.log(sanitizeKeysForMongo(profile));
                            let newUser = new User({
                                username: profile.nameID,
                                idp: this.config.name,
                                attributes: sanitizeKeysForMongo(profile)
                            });
                            return newUser.save();
                        }
                    })
                    .then(user => {
                        if(user) {
                            done(null, user);
                        }
                    })
                    .catch(e => done(e));
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
                res.redirect("/session");
            }
        );

        router.get('/metadata', (req, res) => {
            res.setHeader('content-type', 'application/xml');
            res.send(this.strategy.generateServiceProviderMetadata(fs.readFileSync(this.config.config.public_cert, 'utf8')));
        });


        router.post('/login',
            passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
            function(req, res) {
                res.redirect("/session");
            }
        );

        app.use('/idps/' + this.config.name, router);

        console.log(("/idps/" + this.config.name.bold + " mounted.").green);
    }
}

module.exports = SamlIdentityProvider;
