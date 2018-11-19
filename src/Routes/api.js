// @flow
/*-------------------------------------
 * All API endpoints.
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

// Dependencies
const express             = require('express');
const applyRoutesToRouter = require('../Util/applyRoutesToRouter');
const NotFoundError       = require('../Errors/NotFoundError');
const BadRequestError     = require('../Errors/BadRequestError');

// Controllers
const UserController       = require('../Controllers/api/UserController');
const TutorialController   = require('../Controllers/api/TutorialController');
const CourseController     = require('../Controllers/api/CourseController');
const AuthStatusController = require('../Controllers/api/AuthStatusController');

// Middlewares
const bearerAuthMiddleware            = require('../Middlewares/bearerAuthMiddleware')();
const applicationSecretAuthMiddleware = require('../Middlewares/applicationSecretAuthMiddleware')();

// Flow type imports
const App = require('../App');

/**
 * Function to mount all routes
 * @param app
 */
module.exports = (app: App<any>) => {
    const router: express$Router = express.Router();

    router.use(bearerAuthMiddleware);

    router.get("/ping", (req: Request, res: express$Response) => {
        res.send("PONG");
    });

    router.get("/auth_status", AuthStatusController.getAuthStatus);
    router.get("/auth_tokens/:token_body", AuthStatusController.populateAuthToken);

    // All routes that require application secret authentication
    applyRoutesToRouter(router, {
        middlewares: [applicationSecretAuthMiddleware],
        get: [
            // User
            ["/users", UserController.list],
            ["/users/:user_id", UserController.get],
            ["/users/:user_id/courses", UserController.getCourses],
            ["/users/:user_id/courses/:course_id/tutorials", UserController.getCourseTutorials],
            // Tutorial
            ["/tutorials", TutorialController.list],
            ["/tutorials/:tutorial_id", TutorialController.get],
            // Course
            ["/courses", CourseController.list],
            ["/courses/:course_id", CourseController.get],
            ["/courses/:course_id/students", CourseController.getStudents],
            ["/courses/:course_id/tutorials", CourseController.getTutorials],
            ["/courses/:course_id/tutorials/:tutorial_id", CourseController.getTutorial],
            ["/courses/:course_id/tutorials/:tutorial_id/students", CourseController.getTutorialStudents]
        ]
    });

    router.get("/user", UserController.getCurrent);

    // Custom error handler
    // $FlowFixMe
    router.use((err, req, res, next) => {
        if (err instanceof NotFoundError) res.status(404);
        if (err instanceof BadRequestError) res.status(400);
        res.send({msg: err.message})
    });

    app.app.use('/api', router);
};
