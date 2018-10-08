const User = require('../../models/User');

class UserController {
    static list(req, res, next) {
        if(req.isMaster) {
            User.find({})
                .then(users => {
                    res.send(JSON.stringify(users));
                })
                .catch(e => {
                    next(e);
                })
        } else {
            res.status(401);
            res.send("401");
        }
    }


    static get(req, res, next) {
        if(req.isMaster) {
            User.findOne({_id: req.params.id})
                .then(user => {
                    if(user) {
                        res.send(JSON.stringify(user));
                    } else {
                        res.status(404);
                        res.send("404");
                    }
                })
                .catch(e => {
                    next(e);
                })
        } else {
            res.status(401);
            res.send("401");
        }
    }


}

module.exports = UserController;
