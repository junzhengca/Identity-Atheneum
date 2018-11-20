const express                       = require('express');
const ApplicationController         = require('../Controllers/web/ApplicationController');
const DeveloperDashboardController  = require('../Controllers/web/DeveloperDashboardController');
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
            ["/users/detail/:identifier", admin.UserController.userDetailPage],
            // Course
            ["/courses", admin.CourseController.coursesPage],
            ["/courses/create", admin.CourseController.createCoursePage],
            ["/courses/detail/:name", admin.CourseController.courseDetailPage],
            ["/courses/detail/:name/students/add", admin.CourseController.courseAddStudentsPage],
            ["/courses/detail/:name/tutorials/create", admin.CourseController.courseCreateTutorialPage],
            ["/courses/detail/:name/tutorials/detail/:tutorial_name", admin.CourseController.tutorialDetailPage],
            ["/courses/detail/:name/tutorials/detail/:tutorial_name/students/add", admin.CourseController.tutorialAddStudentsPage],
            // Applications
            ["/applications", admin.ApplicationController.applicationsPage],
            ["/applications/import", admin.ApplicationController.importApplicationPage],
            // System
            ["/system", admin.SystemController.systemPage],
            // Containers
            ["/containers", admin.ContainerController.containersPage],
            ["/containers/create_container", admin.ContainerController.createContainerPage],
            ["/containers/detail/:name", admin.ContainerController.containerDetailPage],
            ["/containers/detail/:name/export/json", admin.ContainerController.exportContainerJSON]
        ],
        post: [
            // User
            ["/users/create_users", admin.UserController.createUsers],
            ["/users/detail/:identifier/add_group", admin.UserController.addGroupToUser],
            ["/users/detail/:identifier/delete_group", admin.UserController.deleteGroupFromUser],
            ["/users/detail/:identifier/delete", admin.UserController.deleteUser],
            // Course
            ["/courses/create", admin.CourseController.createCourse],
            ["/courses/detail/:name", admin.CourseController.updateCourseDetail],
            ["/courses/detail/:name/students/add", admin.CourseController.courseAddStudents],
            ["/courses/detail/:name/tutorials/create", admin.CourseController.courseCreateTutorial],
            ["/courses/detail/:name/students/remove", admin.CourseController.courseRemoveStudent],
            ["/courses/detail/:name/tutorials/detail/:tutorial_name", admin.CourseController.updateTutorialDetail],
            ["/courses/detail/:name/tutorials/detail/:tutorial_name/students/add", admin.CourseController.tutorialAddStudents],
            ["/courses/detail/:name/tutorials/detail/:tutorial_name/students/remove", admin.CourseController.tutorialRemoveStudent],
            // Applications
            ["/applications/:id/delete", admin.ApplicationController.deleteApplication],
            ["/applications/import", admin.ApplicationController.importApplication],
            ["/applications/keys/generate", admin.ApplicationController.applicationGenerateKey],
            ["/applications/keys/revoke", admin.ApplicationController.applicationRevokeKey],
            // Container
            ["/containers/create_container", admin.ContainerController.createContainer]
        ]
    });

    adminDashboardRouter.use(require('../Middlewares/adminAuthMiddleware')());

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

