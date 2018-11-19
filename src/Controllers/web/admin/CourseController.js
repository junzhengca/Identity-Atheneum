// @flow
/*-------------------------------------
 * Controller for Admin course page
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

const Container     = require('../../../Models/Container');
const User          = require('../../../Models/User');
const getRealUrl    = require('../../../Util/getRealUrl');
const NotFoundError = require('../../../Errors/NotFoundError');

/**
 * Controller for Course
 * @type {module.CourseController}
 */
module.exports = class CourseController {
    /**
     * GET /courses
     * Get the courses page
     * @param req
     * @param res
     */
    static async coursesPage(req: Request, res: Response) {
        let containers = await Container.getAllCourses();
        res.render('pages/admin/courses', {
            containers
        });
    }

    /**
     * GET /courses/create
     * Render create course page
     * @param req
     * @param res
     */
    static createCoursePage(req: Request, res: Response) {
        res.render('pages/admin/createCourse');
    }

    /**
     * POST /courses/create
     * Create all resources for a new course
     * @param req
     * @param res
     */
    static async createCourse(req: Request, res: Response) {
        if (!req.body.code.match(/^[a-z0-9]+$/)) {
            req.flash("error", "Invalid course code.");
        } else if (!req.body.name) {
            req.flash("error", "Invalid course name.");
        } else {
            let container = await Container.create("course." + req.body.code, "admin", "admin", "admin", {
                _v: 1,
                _name: req.body.code,
                _displayName: req.body.name
            });
            req.flash("success", "Container created with ID " + container._id);
            return res.redirect(getRealUrl('/admin/courses'));
        }
        res.redirect(getRealUrl('/admin/courses/create'));
    }

    /**
     * GET /courses/detail/:name
     * Render container details page
     * @param req
     * @param res
     */
    static async courseDetailPage(req: Request, res: Response) {
        let container = await Container.findOne({name: req.params.name});
        if (!container || !container.isCourse()) {
            throw new NotFoundError("Course not found.");
        }
        let tutorials = await container.getAllTutorials();
        let students  = await container.getAllStudents();
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
    static async updateCourseDetail(req: Request, res: Response) {
        let container = await Container.findOne({name: req.params.name});
        if (container && container.isCourse()) {
            // Update course name
            if (req.body.name) {
                container.content = {
                    ...container.content,
                    _displayName: req.body.name
                };
            }
            await container.save();
            req.flash("success", "Course updated.");
            res.redirect(getRealUrl('/admin/courses/detail/' + container.name));
        } else {
            throw new NotFoundError("Course not found.");
        }
    }

    /**
     * GET /courses/detail/:name/tutorials/create
     * Render container details page
     * @param req
     * @param res
     */
    static async courseCreateTutorialPage(req: Request, res: Response) {
        let container = await Container.findOne({name: req.params.name});
        if (container && container.isCourse()) {
            res.render('pages/admin/courseCreateTutorial', {
                container
            });
        } else {
            throw new NotFoundError("Course not found.");
        }
    }

    /**
     * POST /courses/detail/:name/tutorials/create
     * Render container details page
     * @param req
     * @param res
     */
    static async courseCreateTutorial(req: Request, res: Response) {
        if (!req.body.code.match(/^[a-z0-9]+$/)) {
            req.flash("error", "Invalid tutorial code.");
        } else if (!req.body.name) {
            req.flash("error", "Invalid tutorial name.");
        } else {
            let container = await Container.findOne({name: req.params.name});
            if (container && container.isCourse()) {
                // Create the tutorial container
                await Container.create(
                    container.name + ".tutorial." + req.body.code,
                    "admin", "admin", "admin",
                    {
                        _v: 1,
                        _name: req.body.code,
                        _displayName: req.body.name
                    }
                );
                req.flash("success", "Container created with ID " + container._id);
                return res.redirect(getRealUrl('/admin/courses/detail/' + req.params.name));
            } else {
                throw new NotFoundError("Course not found.");
            }
        }
        res.redirect(getRealUrl('/admin/courses/detail/' + req.params.name + '/tutorials/create'));
    }

    /**
     * Remove a student from course
     * @param req
     * @param res
     */
    static async courseRemoveStudent(req: Request, res: Response) {
        let course = await Container.findOneOrFail({name: req.params.name});
        if (!course.isCourse()) throw new NotFoundError("Course not found.");
        let user = await User.findByIdentifierOrFail(req.body.name);
        await user.removeContainerAndAllSubContainers(course);
        req.flash("success", "User removed from course.");
        res.redirect(getRealUrl('/admin/courses/detail/' + course.name));
    }

    /**
     * Render tutorial details page
     * @param req
     * @param res
     */
    static async tutorialDetailPage(req: Request, res: Response) {
        // First find the course
        let {course, tutorial} = await Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name);
        let students           = await tutorial.getAllStudents();
        res.render('pages/admin/tutorialDetail', {
            course,
            tutorial,
            students
        });
    }

    /**
     * Add students to tutorial page
     * @param req
     * @param res
     */
    static async tutorialAddStudentsPage(req: Request, res: Response) {
        let {course, tutorial} = await Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name);
        res.render('pages/admin/tutorialAddStudents', {course, tutorial});
    }

    /**
     * Add students to a tutorial
     * @param req
     * @param res
     */
    static async tutorialAddStudents(req: Request, res: Response) {
        let {course, tutorial} = await Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name);
        let uids               = req.body.data.split(/\r?\n/);
        for (let i = 0; i < uids.length; i++) {
            try {
                let user = await User.findByIdentifierOrFail(uids[i]);
                await user.addContainer(tutorial);
                await user.addContainer(course);
                req.flash("success", uids[i] + " added to course and tutorial.");
            } catch (e) {
                req.flash("error", "Failed to find user. [" + e.message + "] for " + uids[i]);
            }
        }
        res.redirect(getRealUrl('/admin/courses/detail/' + course.name + "/tutorials/detail/" + tutorial.name + "/students/add"));
    }

    /**
     * Remove a student from the course
     * @param req
     * @param res
     */
    static async tutorialRemoveStudent(req: Request, res: Response) {
        let {course, tutorial} = await Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name);
        let user = await User.findByIdentifierOrFail(req.body.name);
        await user.removeContainer(tutorial);
        req.flash("success", "User removed from tutorial. However the student is still in the course.");
        res.redirect(getRealUrl('/admin/courses/detail/' + course.name + "/tutorials/detail/" + tutorial.name));
    }
};
