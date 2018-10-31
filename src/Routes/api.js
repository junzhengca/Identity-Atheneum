const express = require('express');
const UserController = require('../Controllers/api/UserController');
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

    router.get("/user", UserController.getCurrent);
    router.get("/users/:id", UserController.get);
    router.get("/users/:id/groups", UserController.getGroups);
    router.post("/users/:id/groups", UserController.addGroup);

    app.app.use('/api', router);
};

