const User                 = require('../../Models/User');
const Application          = require('../../Models/Application');
const ApplicationKey       = require('../../Models/ApplicationKey');
const Container            = require('../../Models/Container');
const getRealUrl           = require('../../Util/getRealUrl');
const isValidGroupName     = require('../../Util/isValidGroupName');
const flattenFlashMessages = require('../../Util/flattenFlashMessages');
const config               = require('../../config');
const NotFoundError        = require('../../Errors/NotFoundError');

module.exports = class AdminDashboardController {

    /**
     * Render applications page
     * @param req
     * @param res
     * @param next
     */
    static applicationsPage(req, res, next) {
        Application.find({})
            .populate('keys')
            .exec()
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
     * Generate a new application key pair
     * @param req
     * @param res
     */
    static applicationGenerateKey(req, res) {
        Application.findOneOrFail({_id: req.body.id})
            .then(app => {
                return app.generateKey();
            })
            .then(key => {
                res.redirectBackWithSuccess("Key generated with ID " + key._id);
            })
            .catch(e => {
                res.redirectBackWithError("Failed to generate key. " + e.message);
            })
    }

    /**
     * Revoke an application key
     * @param req
     * @param res
     */
    static applicationRevokeKey(req, res) {
        ApplicationKey.findOneOrFail({_id: req.body.id})
            .then(key => {
                return key.remove();
            })
            .then(() => {
                res.redirectBackWithSuccess("Key revoked.");
            })
            .catch(e => {
                res.redirectBackWithError("Cannot find key. " + e.message);
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
                if (container) {
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
        if (!data.name || !data.assertion_endpoint) {
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
        if (!req.body.code.match(/^[a-z0-9]+$/)) {
            req.flash("error", "Invalid course code.");
            return res.redirect(getRealUrl('/admin/courses/create'));
        }
        if (!req.body.name) {
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
    static async courseDetailPage(req, res, next) {
        let container = await Container.findOne({name: req.params.name});
        if (!container || !container.isCourse()) {
            throw new NotFoundError("Course not found.");
        }
        let tutorials = await container.getAllTutorials();
        let students = await container.getAllStudents();
        res.render('pages/admin/courseDetail', {
            container,
            tutorials,
            students
        });
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
                if (container && container.isCourse()) {
                    if (req.body.name) {
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
                if (container && container.isCourse()) {
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
        if (!req.body.code.match(/^[a-z0-9]+$/)) {
            req.flash("error", "Invalid tutorial code.");
            return res.redirect(getRealUrl('/admin/courses/detail/' + req.params.name + '/tutorials/create'));
        }
        if (!req.body.name) {
            req.flash("error", "Invalid tutorial name.");
            return res.redirect(getRealUrl('/admin/courses/detail/' + req.params.name + '/tutorials/create'));
        }
        let container;
        Container.findOne({name: req.params.name})
            .then(result => {
                container = result;
                if (container && container.isCourse()) {
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

    /**
     * Remove a student from course
     * @param req
     * @param res
     * @param next
     */
    static courseRemoveStudent(req, res, next) {
        let course;

        Container.findOneOrFail({name: req.params.name})
            .then(container => {
                course = container;
                if (!course.isCourse()) {
                    throw new Error("Course not found.");
                }
                return User.findByIdentifierOrFail(req.body.name);
            })
            .then(user => {
                return user.removeContainerAndAllSubContainers(course);
            })
            .then(() => {
                req.flash("success", "User removed from course.");
                res.redirect(getRealUrl('/admin/courses/detail/' + course.name));
            })
            .catch(e => next(e));
    }


    /**
     * Render tutorial details page
     * @param req
     * @param res
     * @param next
     */
    static tutorialDetailPage(req, res, next) {
        // First find the course
        let course, tutorial, students;
        Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name)
            .then(result => {
                course   = result.course;
                tutorial = result.tutorial;
                return tutorial.getAllStudents();
            })
            .then(users => {
                res.render('pages/admin/tutorialDetail', {
                    getRealUrl,
                    course,
                    tutorial,
                    users,
                    ...flattenFlashMessages(req)
                });
            })
            .catch(e => next(e));
    };

    /**
     * Add students to tutorial page
     * @param req
     * @param res
     * @param next
     */
    static tutorialAddStudentsPage(req, res, next) {
        // First find thr course and tutorial
        Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name)
            .then(result => {
                res.render('pages/admin/tutorialAddStudents', {
                    getRealUrl,
                    ...result,
                    ...flattenFlashMessages(req)
                });
            })
            .catch(e => next(e));
    }

    /**
     * Add students to a tutorial
     * @param req
     * @param res
     * @param next
     */
    static tutorialAddStudents(req, res, next) {
        let course, tutorial;
        // First we find the tutorial
        Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name)
            .then(result => {
                course       = result.course;
                tutorial     = result.tutorial;
                let promises = [];
                // Loop through all users
                req.body.data.split(/\r?\n/).forEach(uid => {
                    promises.push(new Promise(resolve => {
                        User.findByIdentifierOrFail(uid)
                            .then(user => {
                                return user.addContainer(tutorial).then(() => user.addContainer(course));
                            })
                            .then(() => {
                                req.flash("success", uid + " added to course and tutorial.");
                                resolve();
                            })
                            .catch(e => {
                                req.flash("error", "Failed to find user. [" + e.message + "] for " + uid);
                                resolve()
                            })
                    }));
                });
                return Promise.all(promises);
            })
            .then(() => {
                res.redirect(getRealUrl('/admin/courses/detail/' + course.name + "/tutorials/detail/" + tutorial.name + "/students/add"));
            })
            .catch(e => next(e));

    }

    /**
     * Remove a student from the course
     * @param req
     * @param res
     * @param next
     */
    static tutorialRemoveStudent(req, res, next) {
        let course, tutorial;
        // First we find the tutorial
        Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name)
            .then(result => {
                course   = result.course;
                tutorial = result.tutorial;
                return User.findByIdentifierOrFail(req.body.name);
            })
            .then(user => {
                return user.removeContainer(tutorial);
            })
            .then(() => {
                req.flash("success", "User removed from tutorial. However the student is still in the course.");
                res.redirect(getRealUrl('/admin/courses/detail/' + course.name + "/tutorials/detail/" + tutorial.name));
            })
            .catch(e => next(e));
    }

};
