const Application = require('../../Models/Application');
const AuthToken = require('../../Models/AuthToken');
const uuidv4 = require('uuid/v4');
const getRealUrl = require('../../Util/getRealUrl');
const config = require('../../config');

class LoginController {
    /**
     * Render the login page
     * @param req
     * @param res
     * @param next
     */
    static loginPage(req, res, next) {
        if(req.query.id && !req.query.id.match(/^[0-9a-fA-F]{24}$/)) {
            res.render('pages/errors/loginRequestError', {
                title: "Malformed Request - Invalid Application ID",
                message: "The request contains an invalid application ID."
            });
            return;
        }
        // If we actually have a requested app id
        Application.findOne({_id: req.query.id})
            .then(application => {
                // If we have a query, however the application is not found...
                if(req.query.id && !application) {
                    res.render('pages/errors/loginRequestError', {
                        title: "Malformed Request - Application Not Found",
                        message: "We are unable to find the application you are referring to."
                    });
                    return;
                }
                if(application) {
                    req.session.applicationId = application._id.toString();
                    console.log("Session initiated...", req.session.applicationId);
                }
                if(req.user) {
                    res.redirect(getRealUrl('/login_success'));
                } else {
                    res.render('pages/login', {
                        title: "Login",
                        application,
                        getRealUrl,
                        idps: config.identity_providers
                    });
                }

            })
            .catch(e => next(e));
    }

    /**
     * Login success action
     * @param req
     * @param res
     */
    static loginSuccess(req, res) {
        // There are few cases for login success
        if(req.session.applicationId) {
            console.log("Asserting application", req.session.applicationId);
            // Try to find the application
            Application.findOne({_id: req.session.applicationId})
                .then(app => {
                    if(app) {
                        // If we have app, then create an auth token
                        let token = new AuthToken({
                            tokenBody: uuidv4(),
                            userId: req.user._id,
                            applicationId: app._id
                        });
                        token.save()
                            .then(token => {
                                res.render('pages/delayedRedirection', {
                                    url: app.assertionEndpoint + "?token=" + token.tokenBody
                                });
                            });
                    } else {
                        // Redirect to session page
                        res.render('pages/delayedRedirection', {url: getRealUrl('/session')});
                    }
                });
            req.session.applicationId = null;
        } else {
            // Redirect to session page
            res.render('pages/delayedRedirection', {url: getRealUrl('/session')});
        }
    }
}

module.exports = LoginController;
