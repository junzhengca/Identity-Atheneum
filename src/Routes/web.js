const express = require('express');
const ApplicationController = require('../Controllers/web/ApplicationController');
const DeveloperDashboardController = require('../Controllers/web/DeveloperDashboardController');
const AdminDashboardController = require('../Controllers/web/AdminDashboardController');
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

    // Admin dashboard Routes
    const adminDashboardRouter = express.Router();
    adminDashboardRouter.use(require('../Middlewares/adminAuthMiddleware')());
    adminDashboardRouter.get("/", AdminDashboardController.homePage);
    adminDashboardRouter.get("/users", AdminDashboardController.usersPage);
    adminDashboardRouter.get("/users/create_users", AdminDashboardController.createNewUsersPage);
    adminDashboardRouter.post("/users/create_users", AdminDashboardController.createUsers);
    adminDashboardRouter.get("/users/export_users/json", AdminDashboardController.exportUsersJSON);
    adminDashboardRouter.get("/users/detail/:identifier", AdminDashboardController.userDetailPage);
    adminDashboardRouter.post("/users/detail/:identifier/add_group", AdminDashboardController.addGroupToUser);
    adminDashboardRouter.post("/users/detail/:identifier/delete_group", AdminDashboardController.deleteGroupFromUser);
    adminDashboardRouter.post("/users/detail/:identifier/delete", AdminDashboardController.deleteUser);

    adminDashboardRouter.get("/applications", AdminDashboardController.applicationsPage);
    adminDashboardRouter.post("/applications/:id/delete", AdminDashboardController.deleteApplication);

    app.app.use("/admin", adminDashboardRouter);

    // Authentication routes
    app.app.get("/login", LoginController.loginPage);
    app.app.get('/login_success', LoginController.loginSuccess);
    app.app.get('/logout', LogoutController.logout);
    app.app.get("/session", SessionController.sessionPage);
};

