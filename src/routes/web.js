const express = require('express');
const ApplicationController = require('../controllers/web/ApplicationController');
const DeveloperDashboardController = require('../controllers/web/DeveloperDashboardController');
const Application = require('../models/Application');
const uuidv4 = require('uuid/v4');
const AuthToken = require('../models/AuthToken');

module.exports = (app) => {

    // Developer dashboard routes
    const developerDashboardRouter = express.Router();
    developerDashboardRouter.use(require('../middlewares/developerAuthMiddleware')());
    developerDashboardRouter.get("/", DeveloperDashboardController.homePage);
    developerDashboardRouter.get("/add_registration", ApplicationController.addPage);
    developerDashboardRouter.post("/add_registration", ApplicationController.add);
    developerDashboardRouter.post("/remove_registration", ApplicationController.remove);
    app.app.use("/developer", developerDashboardRouter);


    app.app.get("/login", (req, res, next) => {
        // If we actually have a requested app id
        Application.findOne({_id: req.query.id})
            .then(application => {
                if(application) {
                    req.session.applicationId = application._id.toString();
                    console.log("Session initiated...", req.session.applicationId);
                }
                if(req.user) {
                    res.redirect("/login_success");
                } else {
                    res.render('pages/login', {
                        title: "Login",
                        application,
                        idps: app.config.identity_providers
                    });
                }

            })
            .catch(e => next(e));
    });

    app.app.get("/session", (req, res) => {
        if(req.user) {
            res.render('pages/session', {
                title: "Current Session",
                session: req.session,
                user: req.user
            });
        } else {
            res.redirect("/login");
        }
    });

    app.app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/login');
    });

    app.app.get('/login_success', function(req, res) {
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
                            .then(token => res.redirect(app.assertionEndpoint + "?token=" + token.tokenBody));
                    } else {
                        // Redirect to session page
                        res.redirect("/session");
                    }
                });
            req.session.applicationId = null;
        } else {
            // Redirect to session page
            res.redirect("/session");
        }
    });
};

