const User = require('../../Models/User');

class UserController {
    /**
     * List all users
     * @param req
     * @param res
     * @param next
     */
    static list(req, res, next) {
        if(req.application && req.isSecret) {
            User.find({})
                .select('_id username idp')
                .then(users => {
                    res.send(users);
                })
                .catch(e => {
                    next(e);
                })
        } else {
            res.status(401);
            res.send("401");
        }
    }


    /**
     * Get one user
     * @param req
     * @param res
     * @param next
     */
    static get(req, res, next) {
        if(req.application && req.isSecret) {
            User.findOneOrFail({_id: req.params.user_id})
                .then(user => {
                    res.send(user);
                })
                .catch(e => {
                    next(e);
                })
        } else {
            res.status(401);
            res.send("401");
        }
    }

    /**
     * Get all courses
     * @param req
     * @param res
     * @param next
     */
    static getCourses(req, res, next) {
        if(req.application && req.isSecret) {
            User.findOneOrFail({_id: req.params.user_id})
                .then(user => {
                    return user.getAllCourses('-__v');
                })
                .then(courses => {
                    res.send(courses);
                })
                .catch(e => {
                    next(e);
                })
        } else {
            res.status(401);
            res.send("401");
        }
    }

    static getCourseTutorials(req, res, next) {
        if(req.application && req.isSecret) {
            User.findOneOrFail({_id: req.params.user_id})
                .then(user => {
                    return user.getEnrolledTutorialsForCourse(req.params.course_id, '-__v');
                })
                .then(tutorials => {
                    res.send(tutorials);
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

    static getCurrent(req, res, next) {
        res.send(JSON.stringify(req.user));
    }

}

module.exports = UserController;
