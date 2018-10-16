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

    static getGroups(req, res, next) {
        if(req.isMaster) {
            User.findOne({_id: req.params.id})
                .then(user => {
                    if(user) {
                        let groups = user.groups || [];
                        res.send(JSON.stringify(groups));
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

    static addGroup(req, res, next) {
        if(req.isMaster) {
            if(!req.body.group) {
                res.status(400); res.send("You must pass 'group' as an argument to this endpoint.");
                return;
            }
            User.findOne({_id: req.params.id})
                .then(user => {
                    if(user) {
                        let groups = user.groups || [];
                        if(groups.indexOf(req.body.group) < 0) {
                            groups.push(req.body.group);
                        }
                        user.set({groups});
                        return user.save();
                    } else {
                        res.status(404); res.send("We cannot find the user you requested.");
                    }
                })
                .then(user => {
                    if(user) res.send(JSON.stringify({status: "ok"}));
                })
                .catch(e => {
                    next(e);
                })
        } else {
            res.status(401);
            res.send("Only master can access this endpoint.");
        }
    }


}

module.exports = UserController;
