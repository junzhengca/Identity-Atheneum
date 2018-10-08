const express = require('express');
const UserController = require('../controllers/api/UserController');

module.exports = (app) => {
    const router = express.Router();

    router.get("/ping", (req, res) => {
        res.send("PONG");
    });

    router.get("/users", UserController.list);
    router.get("/users/:id", UserController.get);

    app.app.use('/api', router);
};

