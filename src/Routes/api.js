// @flow
/*-------------------------------------
 * All API endpoints.
 *
 * Author(s): Jun Zheng
 --------------------------------------*/

// Dependencies
const express = require('express');

// Controllers
const UserController = require('../Controllers/api/UserController');
const TutorialController = require('../Controllers/api/TutorialController');
const CourseController = require('../Controllers/api/CourseController');
const AuthStatusController = require('../Controllers/api/AuthStatusController');

// Middlewares
const bearerAuthMiddleware = require('../Middlewares/bearerAuthMiddleware')();

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

    router.get("/users", UserController.list);
    router.get("/users/:user_id", UserController.get);
    router.get("/users/:user_id/courses", UserController.getCourses);
    router.get("/users/:user_id/courses/:course_id/tutorials", UserController.getCourseTutorials);

    router.get("/tutorials", TutorialController.list);

    router.get("/courses", CourseController.list);
    router.get("/courses/:course_id", CourseController.get);
    router.get("/courses/:course_id/students", CourseController.getStudents);
    router.get("/courses/:course_id/tutorials", CourseController.getTutorials);
    router.get("/courses/:course_id/tutorials/:tutorial_id", CourseController.getTutorial);
    router.get("/courses/:course_id/tutorials/:tutorial_id/students", CourseController.getTutorialStudents);

    router.get("/user", UserController.getCurrent);
    router.get("/users/:id/groups", UserController.getGroups);
    router.post("/users/:id/groups", UserController.addGroup);

    app.app.use('/api', router);
};
