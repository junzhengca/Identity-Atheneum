const express                       = require('express');
const ApplicationController         = require('../Controllers/web/ApplicationController');
const DeveloperDashboardController  = require('../Controllers/web/DeveloperDashboardController');
const AdminDashboardController      = require('../Controllers/web/AdminDashboardController');
const AdminDashboardIFCATController = require('../Controllers/web/AdminDashboardIFCATController');
const LoginController               = require('../Controllers/web/LoginController');
const LogoutController              = require('../Controllers/web/LogoutController');
const SessionController             = require('../Controllers/web/SessionController');
const getRealUrl                    = require('../Util/getRealUrl');
const flattenFlashMessages          = require('../Util/flattenFlashMessages');
const applyRoutesToRouter           = require('../Util/applyRoutesToRouter');
const admin                         = require('../Controllers/web/admin');


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
    let adminDashboardRouter = express.Router();

    // Admin locals
    adminDashboardRouter.use((req, res, next) => {
        res.locals = {
            ...res.locals,
            getRealUrl,
            req,
            ...flattenFlashMessages(req)
        };
        next();
    });

    applyRoutesToRouter(adminDashboardRouter, {
        middlewares: [require('../Middlewares/adminAuthMiddleware')()],
        get: [
            ["/", admin.HomeController.homePage],
            // User
            ["/users", admin.UserController.usersPage],
            ["/users/create_users", admin.UserController.createNewUsersPage],
            ["/users/export_users/json", admin.UserController.exportUsersJSON],
            ["/users/detail/:identifier", admin.UserController.userDetailPage]
        ],
        post: [
            // User
            ["/users/create_users", admin.UserController.createUsers],
            ["/users/detail/:identifier/add_group", admin.UserController.addGroupToUser],
            ["/users/detail/:identifier/delete_group", admin.UserController.deleteGroupFromUser],
            ["/users/detail/:identifier/delete", admin.UserController.deleteUser]
        ]
    });

    adminDashboardRouter.use(require('../Middlewares/adminAuthMiddleware')());

    adminDashboardRouter.get("/applications", AdminDashboardController.applicationsPage);
    adminDashboardRouter.post("/applications/:id/delete", AdminDashboardController.deleteApplication);
    adminDashboardRouter.post("/applications/keys/generate", AdminDashboardController.applicationGenerateKey);
    adminDashboardRouter.post("/applications/keys/revoke", AdminDashboardController.applicationRevokeKey);
    adminDashboardRouter.get("/applications/import", AdminDashboardController.importApplicationPage);
    adminDashboardRouter.post("/applications/import", AdminDashboardController.importApplication);

    adminDashboardRouter.get("/courses", AdminDashboardController.coursesPage);
    adminDashboardRouter.get("/courses/create", AdminDashboardController.createCoursePage);
    adminDashboardRouter.post("/courses/create", AdminDashboardController.createCourse);
    adminDashboardRouter.get("/courses/detail/:name", AdminDashboardController.courseDetailPage);
    adminDashboardRouter.post("/courses/detail/:name", AdminDashboardController.updateCourseDetail);
    adminDashboardRouter.get("/courses/detail/:name/tutorials/create", AdminDashboardController.courseCreateTutorialPage);
    adminDashboardRouter.post("/courses/detail/:name/tutorials/create", AdminDashboardController.courseCreateTutorial);
    adminDashboardRouter.post("/courses/detail/:name/students/remove", AdminDashboardController.courseRemoveStudent);
    adminDashboardRouter.get("/courses/detail/:name/tutorials/detail/:tutorial_name", AdminDashboardController.tutorialDetailPage);
    adminDashboardRouter.get("/courses/detail/:name/tutorials/detail/:tutorial_name/students/add", AdminDashboardController.tutorialAddStudentsPage);
    adminDashboardRouter.post("/courses/detail/:name/tutorials/detail/:tutorial_name/students/add", AdminDashboardController.tutorialAddStudents);
    adminDashboardRouter.post("/courses/detail/:name/tutorials/detail/:tutorial_name/students/remove", AdminDashboardController.tutorialRemoveStudent);


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

