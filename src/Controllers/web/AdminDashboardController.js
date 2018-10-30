const User = require('../../Models/User');
const Application = require('../../Models/Application');
const Container = require('../../Models/Container');
const getRealUrl = require('../../Util/getRealUrl');
const isValidGroupName = require('../../Util/isValidGroupName');
const flattenFlashMessages = require('../../Util/flattenFlashMessages');
const config = require('../../config');

module.exports = class AdminDashboardController {
    /**
     * Render home page
     * @param req
     * @param res
     */
    static homePage(req, res) {
        User.find({})
            .then(users => {
                res.render('pages/admin/home', {
                    title: "Admin Dashboard",
                    users,
                    getRealUrl
                });
            });
    }

    /**
     * Render user listing page
     * @param req
     * @param res
     */
    static usersPage(req, res) {
        User.find({
            idp: {$regex: req.query.idp || /.*/},
            groups: req.query.group ? {$regex: req.query.group || /.*/} : {$exists: true}
        })
            .then(users => {
                console.log(users);
                res.render('pages/admin/users', {
                    title: "Users - Admin Dashboard",
                    users,
                    req,
                    getRealUrl,
                    ...flattenFlashMessages(req)
                });
            });
    }

    /**
     * Render create new users page
     * @param req
     * @param res
     */
    static createNewUsersPage(req, res) {
        res.render('pages/admin/createUsers', {
            title: "Create New Users - Admin Dashboard",
            getRealUrl,
            ...flattenFlashMessages(req)
        })
    }

    /**
     * Create a list of users
     * @param req
     * @param res
     */
    static createUsers(req, res) {
        // First get all users
        if (!req.body.users) {
            req.flash("errors", "You must have at least one user.");
            res.redirect(getRealUrl('/admin/users/create_users'));
        } else {
            let chain = [];
            // Parse every user
            let input = req.body.users.split(/\r?\n/);
            for (let i = 0; i < input.length; i++) {
                let line = input[i].split(/\s+/);
                chain.push(new Promise((resolve, reject) => {
                    if (line.length < 3) {
                        req.flash("errors", `Error on line ${i}, invalid number of arguments.`);
                        return resolve();
                    }
                    // Otherwise we create the user
                    User.create(line[0], line[1], line[2], "", line.splice(3), {})
                        .then(user => {
                            req.flash("success", `User created with ID ${user._id}.`);
                            resolve();
                        })
                        .catch(e => {
                            req.flash("errors", e.message);
                            resolve();
                        })
                }));
            }
            Promise.all(chain)
                .then(() => {
                    res.redirect(getRealUrl('/admin/users/create_users'));
                })
                .catch(e => {
                    res.redirect(getRealUrl('/admin/users/create_users'));
                })
        }
    }

    /**
     * Export user list in JSON format
     * @param req
     * @param res
     * @param next
     */
    static exportUsersJSON(req, res, next) {
        User.find({})
            .then(users => {
                res.header('content-type', 'application/json');
                res.send(JSON.stringify(users));
            })
            .catch(e => next(e));
    }

    /**
     * GET /users/detail/:identifier
     * Get user details page
     * @param req
     * @param res
     * @param next
     */
    static userDetailPage(req, res, next) {
        User.findByIdentifier(req.params.identifier)
            .then(user => {
                if (user) {
                    res.render('pages/admin/userDetail', {
                        title: user.getReadableId() + " Detail - Admin Dashboard",
                        req, getRealUrl, user,
                        ...flattenFlashMessages(req)
                    })
                } else {
                    res.send("User not found.");
                }
            })
            .catch(e => next(e));
    }

    /**
     * POST /users/detail/:identifier/add_group
     * Add a new group to user
     * @param req
     * @param res
     * @param next
     */
    static addGroupToUser(req, res, next) {
        User.findByIdentifier(req.params.identifier)
            .then(user => {
                if (user) {
                    if (!req.body.name) {
                        throw new Error("You must enter a group name.");
                    } else if (!isValidGroupName(req.body.name)) {
                        throw new Error("Group name invalid, can only contain a-z, 0-9 and .");
                    } else if (user.groups.indexOf(req.body.name) >= 0) {
                        throw new Error("Group already exist.");
                    } else {
                        user.groups.push(req.body.name);
                        return user.save();
                    }
                } else {
                    throw new Error("User not found.");
                }
            })
            .then(() => {
                req.flash("success", "Group added.");
                res.redirect(getRealUrl('/admin/users/detail/' + req.params.identifier));
            })
            .catch(e => {
                req.flash("errors", e.message);
                res.redirect(getRealUrl('/admin/users/detail/' + req.params.identifier));
            })
    }

    /**
     * POST /users/detail/:identifier/delete_group
     * Remove a group from user
     * @param req
     * @param res
     * @param next
     */
    static deleteGroupFromUser(req, res, next) {
        User.findByIdentifier(req.params.identifier)
            .then(user => {
                if (user) {
                    if (!req.body.name) {
                        throw new Error("You must enter a group name.");
                    } else if (user.groups.indexOf(req.body.name) < 0) {
                        throw new Error("Group does not exist.");
                    } else {
                        let index = user.groups.indexOf(req.body.name);
                        user.groups.splice(index, 1);
                        return user.save();
                    }
                } else {
                    throw new Error("User not found.");
                }
            })
            .then(() => {
                req.flash("success", "Group removed.");
                res.redirect(getRealUrl('/admin/users/detail/' + req.params.identifier));
            })
            .catch(e => {
                req.flash("errors", e.message);
                res.redirect(getRealUrl('/admin/users/detail/' + req.params.identifier));
            })
    }

    /**
     * POST /users/detail/:identifier/delete
     * Delete an user
     * @param req
     * @param res
     * @param next
     */
    static deleteUser(req, res, next) {
        User.findByIdentifier(req.params.identifier)
            .then(user => {
                if (user) {
                    return user.remove();
                } else {
                    throw new Error("User not found.");
                }
            })
            .then(() => {
                req.flash("success", "User removed.");
                res.redirect(getRealUrl('/admin/users'));
            })
            .catch(e => {
                req.flash("errors", e.message);
                res.redirect(getRealUrl('/admin/users'));
            })
    }

    /**
     * Render applications page
     * @param req
     * @param res
     * @param next
     */
    static applicationsPage(req, res, next) {
        Application.find({})
            .then(applications => {
                res.render('pages/admin/applications', {
                    applications,
                    req,
                    getRealUrl,
                    ...flattenFlashMessages(req)
                });
            });
    }

    /**
     * Delete an application
     * @param req
     * @param res
     */
    static deleteApplication(req, res) {
        Application.findOne({_id: req.params.id})
            .then(app => {
                if (!app) {
                    throw new Error("Application not found.");
                } else {
                    return app.remove();
                }
            })
            .then(() => {
                req.flash("success", "Application removed.");
                res.redirect(getRealUrl('/admin/applications'));
            })
            .catch(e => {
                req.flash("errors", e.message);
                res.redirect(getRealUrl('/admin/applications'));
            })
    }

    /**
     * GET /system
     * Get systems page
     * @param req
     * @param res
     */
    static systemPage(req, res) {
        res.render('pages/admin/system', {
            getRealUrl,
            config,
            ...flattenFlashMessages(req)
        });
    }

    /**
     * GET /containers
     * Render containers page
     * @param req
     * @param res
     */
    static containersPage(req, res) {
        Container.find({})
            .then(containers => {
                res.render('pages/admin/containers', {
                    getRealUrl,
                    containers,
                    ...flattenFlashMessages(req)
                })
            });
    }

    /**
     * GET /containers/create_container
     * Render create container page
     * @param req
     * @param res
     */
    static createContainerPage(req, res) {
        res.render('pages/admin/createContainer', {
            getRealUrl,
            ...flattenFlashMessages(req)
        })
    }

    /**
     * POST /containers/create_container
     * Create a new container
     * @param req
     * @param res
     */
    static createContainer(req, res) {
        Container.create(req.body.name, req.body.read_groups, req.body.write_groups, req.body.delete_groups)
            .then(container => {
                req.flash("success", "Container created " + container._id + ".");
                res.redirect(getRealUrl('/admin/containers'));
            })
            .catch(e => {
                req.flash("errors", e.message);
                res.redirect(getRealUrl('/admin/containers'));
            })
    }

    /**
     * GET /containers/detail/:name
     * Render container details page
     * @param req
     * @param res
     */
    static containerDetailPage(req, res) {
        Container.findOne({name: req.params.name})
            .then(container => {
                if(container) {
                    res.render('pages/admin/containerDetail', {
                        getRealUrl,
                        container,
                        ...flattenFlashMessages(req)
                    });
                } else {
                    res.send("Container not found.");
                }
            })
    }

    /**
     * Export container into JSON format
     * @param req
     * @param res
     */
    static exportContainerJSON(req, res) {
        Container.findOne({name: req.params.name})
            .then(container => {
                if (container) {
                    res.header('content-type', 'application/json');
                    res.send(JSON.stringify(container));
                } else {
                    res.send("Container not found.");
                }
            })
    }

    /**
     * Render import application page
     * @param req
     * @param res
     */
    static importApplicationPage(req, res) {
        res.render('pages/admin/importApplication', {
            getRealUrl,
            ...flattenFlashMessages(req)
        });
    }

    /**
     * Actually import the application
     * @param req
     * @param res
     */
    static importApplication(req, res) {
        let data;
        try {
            data = JSON.parse(req.body.data);
        } catch (e) {
            req.flash("error", "Invalid JSON. Please check your request and try again.");
            return res.redirect(getRealUrl('/admin/applications/import'));
        }
        // Check data
        if(!data.name || !data.assertion_endpoint) {
            req.flash("error", "Invalid request. Please check your request and try again.");
            return res.redirect(getRealUrl('/admin/applications/import'));
        }
        // Actually have the valid request, attempt to create one with no group
        Application.create(req.user._id, data.name, data.assertion_endpoint, [])
            .then(app => {
                req.flash("success", "Application " + app._id + " registered.");
                return res.redirect(getRealUrl('/admin/applications'));
            })
            .catch(e => {
                req.flash("error", e.message);
                return res.redirect(getRealUrl('/admin/applications/import'));
            })
    }

    /**
     * GET /courses
     * Get the courses page
     * @param req
     * @param res
     */
    static coursesPage(req, res) {
        Container.getAllCourses()
            .then(containers => {
                res.render('pages/admin/courses', {
                    containers,
                    getRealUrl,
                    ...flattenFlashMessages(req)
                });
            });
    }

    /**
     * GET /courses/create
     * Render create course page
     * @param req
     * @param res
     */
    static createCoursePage(req, res) {
        res.render('pages/admin/createCourse', {
            getRealUrl,
            ...flattenFlashMessages(req)
        })
    }

    /**
     * POST /courses/create
     * Create all resources for a new course
     * @param req
     * @param res
     */
    static createCourse(req, res) {
        if(!req.body.code.match(/^[a-z0-9]+$/)) {
            req.flash("error", "Invalid course code.");
            return res.redirect(getRealUrl('/admin/courses/create'));
        }
        if(!req.body.name) {
            req.flash("error", "Invalid course name.");
            return res.redirect(getRealUrl('/admin/courses/create'));
        }
        Container.create("course." + req.body.code, "admin", "admin", "admin", {
            _v: 1,
            _name: req.body.code,
            _displayName: req.body.name
        })
            .then(container => {
                req.flash("success", "Container created with ID " + container._id);
                res.redirect(getRealUrl('/admin/courses'));
            })
            .catch(e => {
                req.flash("error", e.message);
                return res.redirect(getRealUrl('/admin/courses/create'));
            })

    }

    /**
     * GET /courses/detail/:name
     * Render container details page
     * @param req
     * @param res
     * @param next
     */
    static courseDetailPage(req, res, next) {
        let container, tutorials;
        Container.findOne({name: req.params.name})
            .then(result => {
                container = result;
                if(container && container.isCourse()) {
                    return container.getAllTutorials();
                } else {
                    throw new Error("Course not found.");
                }
            })
            .then(result => {
                tutorials = result;
                res.render('pages/admin/courseDetail', {
                    getRealUrl,
                    container,
                    tutorials,
                    ...flattenFlashMessages(req)
                });
            })
            .catch(e => next(e));
    }

    /**
     * POST /courses/detail/:name
     * Update an course
     * @param req
     * @param res
     */
    static updateCourseDetail(req, res) {
        Container.findOne({name: req.params.name})
            .then(container => {
                if(container && container.isCourse()) {
                    if(req.body.name) {
                        container.content = {
                            ...container.content,
                            _displayName: req.body.name
                        };
                    }
                    return container.save();
                } else {
                    res.send("Course not found.");
                }
            })
            .then(container => {
                req.flash("success", "Course updated.");
                res.redirect(getRealUrl('/admin/courses/detail/' + container.name));
            })
            .catch(e => {
                req.flash("error", e.message);
                res.redirect(getRealUrl('/admin/courses/detail/' + container.name));
            })
    }

    /**
     * GET /courses/detail/:name/tutorials/create
     * Render container details page
     * @param req
     * @param res
     * @param next
     */
    static courseCreateTutorialPage(req, res, next) {
        let container;
        Container.findOne({name: req.params.name})
            .then(result => {
                container = result;
                if(container && container.isCourse()) {
                    res.render('pages/admin/courseCreateTutorial', {
                        getRealUrl,
                        container,
                        ...flattenFlashMessages(req)
                    });
                } else {
                    throw new Error("Course not found.");
                }
            })
            .catch(e => next(e));
    }

    /**
     * POST /courses/detail/:name/tutorials/create
     * Render container details page
     * @param req
     * @param res
     * @param next
     */
    static courseCreateTutorial(req, res, next) {
        if(!req.body.code.match(/^[a-z0-9]+$/)) {
            req.flash("error", "Invalid tutorial code.");
            return res.redirect(getRealUrl('/admin/courses/detail/' + req.params.name + '/tutorials/create'));
        }
        if(!req.body.name) {
            req.flash("error", "Invalid tutorial name.");
            return res.redirect(getRealUrl('/admin/courses/detail/' + req.params.name + '/tutorials/create'));
        }
        let container;
        Container.findOne({name: req.params.name})
            .then(result => {
                container = result;
                if(container && container.isCourse()) {
                    // Create the tutorial container
                    return Container.create(
                        container.name + ".tutorial." + req.body.code,
                        "admin", "admin", "admin",
                        {
                            _v: 1,
                            _name: req.body.code,
                            _displayName: req.body.name
                        }
                    );
                } else {
                    throw new Error("Course not found.");
                }
            })
            .then(container => {
                req.flash("success", "Container created with ID " + container._id);
                res.redirect(getRealUrl('/admin/courses/detail/' + req.params.name));
            })
            .catch(e => next(e));
    }
};
