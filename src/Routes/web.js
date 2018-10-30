const express = require('express');
const ApplicationController = require('../Controllers/web/ApplicationController');
const DeveloperDashboardController = require('../Controllers/web/DeveloperDashboardController');
const AdminDashboardController = require('../Controllers/web/AdminDashboardController');
const AdminDashboardIFCATController = require('../Controllers/web/AdminDashboardIFCATController');
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
    adminDashboardRouter.get("/applications/import", AdminDashboardController.importApplicationPage);
    adminDashboardRouter.post("/applications/import", AdminDashboardController.importApplication);

    adminDashboardRouter.get("/courses", AdminDashboardController.coursesPage);
    adminDashboardRouter.get("/courses/create", AdminDashboardController.createCoursePage);
    adminDashboardRouter.post("/courses/create", AdminDashboardController.createCourse);
    adminDashboardRouter.get("/courses/detail/:name", AdminDashboardController.courseDetailPage);
    adminDashboardRouter.post("/courses/detail/:name", AdminDashboardController.updateCourseDetail);
    adminDashboardRouter.get("/courses/detail/:name/tutorials/create", AdminDashboardController.courseCreateTutorialPage);
    adminDashboardRouter.post("/courses/detail/:name/tutorials/create", AdminDashboardController.courseCreateTutorial);
    adminDashboardRouter.get("/courses/detail/:name/tutorials/detail/:tutorial_name", AdminDashboardController.tutorialDetailPage);
    adminDashboardRouter.get("/courses/detail/:name/tutorials/detail/:tutorial_name/students/add", AdminDashboardController.tutorialAddStudentsPage);
    adminDashboardRouter.post("/courses/detail/:name/tutorials/detail/:tutorial_name/students/add", AdminDashboardController.tutorialAddStudents);


    adminDashboardRouter.get("/system", AdminDashboardController.systemPage);

    adminDashboardRouter.get("/containers", AdminDashboardController.containersPage);
    adminDashboardRouter.get("/containers/create_container", AdminDashboardController.createContainerPage);
    adminDashboardRouter.post("/containers/create_container", AdminDashboardController.createContainer);
    adminDashboardRouter.get("/containers/detail/:name", AdminDashboardController.containerDetailPage);
    adminDashboardRouter.get("/containers/detail/:name/export/json", AdminDashboardController.exportContainerJSON);

    // IFCAT Management Routes
    const adminDashboardIFCATRouter = express.Router();

    adminDashboardIFCATRouter.use("/:id/ifcat*", require('../Middlewares/ensureIFCATMiddleware')());
    adminDashboardIFCATRouter.get("/:id/ifcat", AdminDashboardIFCATController.homePage);

    adminDashboardRouter.use("/applications", adminDashboardIFCATRouter);


    app.app.use("/admin", adminDashboardRouter);

    // Authentication routes
    app.app.get("/login", LoginController.loginPage);
    app.app.get('/login_success', LoginController.loginSuccess);
    app.app.get('/logout', LogoutController.logout);
    app.app.get("/session", SessionController.sessionPage);
};

