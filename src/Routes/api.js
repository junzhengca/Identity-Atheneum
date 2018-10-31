const express = require('express');
const UserController = require('../Controllers/api/UserController');
const CourseController = require('../Controllers/api/CourseController');
const AuthStatusController = require('../Controllers/api/AuthStatusController');
const bearerAuthMiddleware = require('../Middlewares/bearerAuthMiddleware')();


module.exports = (app) => {
    const router = express.Router();

    router.use(bearerAuthMiddleware);

    router.get("/ping", (req, res) => {
        res.send("PONG");
    });

    router.get("/auth_status", AuthStatusController.getAuthStatus);

    router.get("/users", UserController.list);

    router.get("/courses", CourseController.list);
    router.get("/courses/:course_id", CourseController.get);
    router.get("/courses/:course_id/students", CourseController.getStudents);
    router.get("/courses/:course_id/tutorials", CourseController.getTutorials);
    router.get("/courses/:course_id/tutorials/:tutorial_id", CourseController.getTutorial);
    router.get("/courses/:course_id/tutorials/:tutorial_id/students", CourseController.getTutorialStudents);

    router.get("/user", UserController.getCurrent);
    router.get("/users/:id", UserController.get);
    router.get("/users/:id/groups", UserController.getGroups);
    router.post("/users/:id/groups", UserController.addGroup);

    app.app.use('/api', router);
};

