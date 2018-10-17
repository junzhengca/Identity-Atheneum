const express = require('express');
const ApplicationController = require('../controllers/web/ApplicationController');
const DeveloperDashboardController = require('../controllers/web/DeveloperDashboardController');

module.exports = (app) => {

    // Developer dashboard routes
    const developerDashboardRouter = express.Router();
    developerDashboardRouter.use(require('../middlewares/developerAuthMiddleware')());
    developerDashboardRouter.get("/", DeveloperDashboardController.homePage);
    developerDashboardRouter.get("/add_registration", ApplicationController.addPage);
    developerDashboardRouter.post("/add_registration", ApplicationController.add);
    developerDashboardRouter.post("/remove_registration", ApplicationController.remove);
    app.app.use("/developer", developerDashboardRouter);


    app.app.get("/login", (req, res) => {
        if(req.user) {
            res.redirect("/session");
        } else {
            res.render('pages/login', {
                title: "Login",
                idps: app.config.identity_providers
            });
        }
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
};

