const express = require('express');
const ApplicationController = require('../Controllers/web/ApplicationController');
const DeveloperDashboardController = require('../Controllers/web/DeveloperDashboardController');
const LoginController = require('../Controllers/web/LoginController');
const LogoutController = require('../Controllers/web/LogoutController');
const SessionController = require('../Controllers/web/SessionController');

module.exports = (app) => {

    // Developer dashboard Routes
    const developerDashboardRouter = express.Router();
    developerDashboardRouter.use(require('../Middlewares/developerAuthMiddleware')());
    developerDashboardRouter.get("/", DeveloperDashboardController.homePage);
    developerDashboardRouter.get("/add_registration", ApplicationController.addPage);
    developerDashboardRouter.post("/add_registration", ApplicationController.add);
    developerDashboardRouter.post("/remove_registration", ApplicationController.remove);
    app.app.use("/developer", developerDashboardRouter);

    // Authentication routes
    app.app.get("/login", LoginController.loginPage);
    app.app.get('/login_success', LoginController.loginSuccess);
    app.app.get('/logout', LogoutController.logout);
    app.app.get("/session", SessionController.sessionPage);
};

