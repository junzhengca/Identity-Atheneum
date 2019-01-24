const express = require('express');
const ApplicationController = require('../Controllers/web/ApplicationController');
const DeveloperDashboardController = require('../Controllers/web/DeveloperDashboardController');
const LoginController = require('../Controllers/web/LoginController');
const LogoutController = require('../Controllers/web/LogoutController');
const SessionController = require('../Controllers/web/SessionController');
const getRealUrl = require('../Util/getRealUrl');
const flattenFlashMessages = require('../Util/flattenFlashMessages');
const applyRoutesToRouter = require('../Util/applyRoutesToRouter');
const admin = require('../Controllers/web/admin');
const ensureAdminMiddleware = require('../Middlewares/ensureAdminMiddleware');

module.exports = app => {
    app.app.get('/', (req, res) => res.redirect(getRealUrl('/login')));

    // Developer dashboard Routes
    const developerDashboardRouter = express.Router();
    developerDashboardRouter.use(require('../Middlewares/developerAuthMiddleware')());
    developerDashboardRouter.get('/', DeveloperDashboardController.homePage);
    developerDashboardRouter.get('/add_registration', ApplicationController.addPage);
    developerDashboardRouter.post('/add_registration', ApplicationController.add);
    developerDashboardRouter.post('/remove_registration', ApplicationController.remove);
    app.app.use('/developer', developerDashboardRouter);

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
        middlewares: [require('../Middlewares/adminDashboardAuthMiddleware')()],
        get: [
            ['/', admin.HomeController.homePage],
            ['/advanced', ensureAdminMiddleware(), admin.HomeController.homeAdvancedPage],
            // User
            ['/users', ensureAdminMiddleware(), admin.UserController.usersPage],
            ['/users/create_users', ensureAdminMiddleware(), admin.UserController.createNewUsersPage],
            ['/users/export_users/json', ensureAdminMiddleware(), admin.UserController.exportUsersJSON],
            ['/users/detail/:identifier', ensureAdminMiddleware(), admin.UserController.userDetailPage],
            // Course
            ['/courses', admin.CourseController.coursesPage],
            ['/courses/create', ensureAdminMiddleware(), admin.CourseController.createCoursePage],
            ['/courses/detail/:name', admin.CourseController.courseDetailPage],
            ['/courses/detail/:name/members/add', ensureAdminMiddleware(), admin.CourseController.courseAddMembersPage],
            [
                '/courses/detail/:name/tutorials/create',
                ensureAdminMiddleware(),
                admin.CourseController.courseCreateTutorialPage
            ],
            ['/courses/detail/:name/tutorials/detail/:tutorial_name', admin.CourseController.tutorialDetailPage],
            [
                '/courses/detail/:name/tutorials/detail/:tutorial_name/students/add',
                admin.CourseController.tutorialAddStudentsPage
            ],
            // Applications
            ['/applications', ensureAdminMiddleware(), admin.ApplicationController.applicationsPage],
            ['/applications/import', ensureAdminMiddleware(), admin.ApplicationController.importApplicationPage],
            // System
            ['/system', ensureAdminMiddleware(), admin.SystemController.systemPage],
            // Containers
            ['/containers', ensureAdminMiddleware(), admin.ContainerController.containersPage],
            ['/containers/create_container', ensureAdminMiddleware(), admin.ContainerController.createContainerPage],
            ['/containers/detail/:name', ensureAdminMiddleware(), admin.ContainerController.containerDetailPage],
            [
                '/containers/detail/:name/export/json',
                ensureAdminMiddleware(),
                admin.ContainerController.exportContainerJSON
            ]
        ],
        post: [
            // User
            ['/users/create_users', ensureAdminMiddleware(), admin.UserController.createUsers],
            ['/users/detail/:identifier/add_group', ensureAdminMiddleware(), admin.UserController.addGroupToUser],
            [
                '/users/detail/:identifier/delete_group',
                ensureAdminMiddleware(),
                admin.UserController.deleteGroupFromUser
            ],
            ['/users/detail/:identifier/delete', ensureAdminMiddleware(), admin.UserController.deleteUser],
            // Course
            ['/courses/create', ensureAdminMiddleware(), admin.CourseController.createCourse],
            ['/courses/detail/:name', ensureAdminMiddleware(), admin.CourseController.updateCourseDetail],
            ['/courses/detail/:name/delete', ensureAdminMiddleware(), admin.CourseController.deleteCourse],
            ['/courses/detail/:name/members/add', ensureAdminMiddleware(), admin.CourseController.courseAddMembers],
            [
                '/courses/detail/:name/members/add_one',
                ensureAdminMiddleware(),
                admin.CourseController.courseAddOneMember
            ],
            [
                '/courses/detail/:name/tutorials/create',
                ensureAdminMiddleware(),
                admin.CourseController.courseCreateTutorial
            ],
            [
                '/courses/detail/:name/students/remove',
                ensureAdminMiddleware(),
                admin.CourseController.courseRemoveStudent
            ],
            [
                '/courses/detail/:name/tutorials/detail/:tutorial_name',
                ensureAdminMiddleware(),
                admin.CourseController.updateTutorialDetail
            ],
            [
                '/courses/detail/:name/tutorials/detail/:tutorial_name/delete',
                ensureAdminMiddleware(),
                admin.CourseController.deleteTutorial
            ],
            [
                '/courses/detail/:name/tutorials/detail/:tutorial_name/students/add',
                admin.CourseController.tutorialAddStudents
            ],
            [
                '/courses/detail/:name/tutorials/detail/:tutorial_name/students/remove',
                admin.CourseController.tutorialRemoveStudent
            ],
            // Applications
            ['/applications/:id/delete', ensureAdminMiddleware(), admin.ApplicationController.deleteApplication],
            ['/applications/import', ensureAdminMiddleware(), admin.ApplicationController.importApplication],
            [
                '/applications/keys/generate',
                ensureAdminMiddleware(),
                admin.ApplicationController.applicationGenerateKey
            ],
            ['/applications/keys/revoke', ensureAdminMiddleware(), admin.ApplicationController.applicationRevokeKey],
            // Container
            ['/containers/create_container', ensureAdminMiddleware(), admin.ContainerController.createContainer],
            ['/containers/detail/:name', ensureAdminMiddleware(), admin.ContainerController.updateContainerDetail]
        ]
    });

    app.app.use('/admin', adminDashboardRouter);

    let rootRouter = express.Router();
    applyRoutesToRouter(rootRouter, {
        middlewares: [],
        get: [
            ['/login', LoginController.loginPage],
            ['/login_success', LoginController.loginSuccess],
            ['/session', SessionController.sessionPage],
            ['/logout', LogoutController.logout]
        ]
    });

    app.app.use('/', rootRouter);
};
