// @flow
/*-------------------------------------
 * Controller for Admin course page
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

const Container             = require('../../../Models/Container');
const User                  = require('../../../Models/User');
const getRealUrl            = require('../../../Util/getRealUrl');
const NotFoundError         = require('../../../Errors/NotFoundError');
const csvStringToJsonObject = require('../../../Util/csvStringToJsonObject');


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
    static async coursesPage(req: Request, res: Response): Promise<void> {
        let containers: Container = await Container.getAllCourses();
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
    static createCoursePage(req: Request, res: Response): void {
        res.render('pages/admin/createCourse');
    }

    /**
     * POST /courses/create
     * Create all resources for a new course
     * @param req
     * @param res
     */
    static async createCourse(req: Request, res: Response): Promise<void> {
        if (!req.body.code.match(/^[a-z0-9]+$/)) {
            req.flash("error", "Invalid course code.");
        } else if (!req.body.name) {
            req.flash("error", "Invalid course name.");
        } else {
            let container: Container = await Container.create("course." + req.body.code, "admin", "admin", "admin", {
                _v: 1,
                _name: req.body.code,
                _displayName: req.body.name
            });
            req.flash("success", "Container created with ID " + container._id);
            res.redirect(getRealUrl('/admin/courses'));
            return;
        }
        res.redirect(getRealUrl('/admin/courses/create'));
    }

    /**
     * GET /courses/detail/:name
     * Render container details page
     * @param req
     * @param res
     */
    static async courseDetailPage(req: Request, res: Response): Promise<void> {
        let container: Container = await Container.findOne({name: req.params.name});
        if (!container || !container.isCourse()) {
            throw new NotFoundError("Course not found.");
        }
        let tutorials: Container[] = await container.getAllTutorials();
        let users: User[]          = await container.getAllUsers();
        res.render('pages/admin/courseDetail', {
            container,
            tutorials,
            users
        });
    }

    /**
     * POST /courses/detail/:name
     * Update an course
     * @param req
     * @param res
     */
    static async updateCourseDetail(req: Request, res: Response): Promise<void> {
        let container: Container = await Container.findOne({name: req.params.name});
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
    static async courseCreateTutorialPage(req: Request, res: Response): Promise<void> {
        let container: Container = await Container.findOne({name: req.params.name});
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
    static async courseCreateTutorial(req: Request, res: Response): Promise<void> {
        if (!req.body.code.match(/^[a-z0-9]+$/)) {
            req.flash("error", "Invalid tutorial code.");
        } else if (!req.body.name) {
            req.flash("error", "Invalid tutorial name.");
        } else {
            let container: Container = await Container.findOne({name: req.params.name});
            if (container && container.isCourse()) {
                // Create the tutorial container
                let tutorial: Container = await Container.create(
                    container.name + ".tutorial." + req.body.code,
                    "admin", "admin", "admin",
                    {
                        _v: 1,
                        _name: req.body.code,
                        _displayName: req.body.name
                    }
                );
                req.flash("success", "Container created with ID " + tutorial._id);
                res.redirect(getRealUrl('/admin/courses/detail/' + req.params.name));
                return;
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
    static async courseRemoveStudent(req: Request, res: Response): Promise<void> {
        let course: Container = await Container.findOneOrFail({name: req.params.name});
        if (!course.isCourse()) throw new NotFoundError("Course not found.");
        let user: User = await User.findByIdentifierOrFail(req.body.name);
        await user.removeContainerAndAllSubContainers(course);
        req.flash("success", "User removed from course.");
        res.redirect(getRealUrl('/admin/courses/detail/' + course.name));
    }

    /**
     * Render tutorial details page
     * @param req
     * @param res
     */
    static async tutorialDetailPage(req: Request, res: Response): Promise<void> {
        // First find the course
        let {course, tutorial} = await Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name);
        let students: User[]   = await tutorial.getAllStudents();
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
    static async tutorialAddStudentsPage(req: Request, res: Response): Promise<void> {
        let {course, tutorial} = await Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name);
        res.render('pages/admin/tutorialAddStudents', {course, tutorial});
    }

    /**
     * Add students to a tutorial
     * @param req
     * @param res
     */
    static async tutorialAddStudents(req: Request, res: Response): Promise<void> {
        let {course, tutorial} = await Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name);
        let uids: string[]     = req.body.data.split(/\r?\n/);
        for (let i = 0; i < uids.length; i++) {
            try {
                let user: User = await User.findByIdentifierOrFail(uids[i]);
                await user.addContainer(tutorial, ".student");
                await user.addContainer(course, ".student");
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
    static async tutorialRemoveStudent(req: Request, res: Response): Promise<void> {
        let {course, tutorial} = await Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name);
        let user: User         = await User.findByIdentifierOrFail(req.body.name);
        await user.removeContainer(tutorial, ".student");
        req.flash("success", "User removed from tutorial. However the student is still in the course.");
        res.redirect(getRealUrl('/admin/courses/detail/' + course.name + "/tutorials/detail/" + tutorial.name));
    }

    /**
     * Get add students to course page
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async courseAddMembersPage(req: Request, res: Response): Promise<void> {
        let course: Container = await Container.findOneOrFail({name: req.params.name});
        if (course.isCourse()) {
            res.render('pages/admin/courseAddMembers', {course});
        } else {
            throw new NotFoundError("Course not found.");
        }
    }

    /**
     * Add students to course
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async courseAddMembers(req: Request, res: Response): Promise<void> {
        let course: Container = await Container.findOneOrFail({name: req.params.name});
        if(!course.isCourse()) throw new NotFoundError("Course not found.");
        let log = `Import finished, please see log below for more details.\n${new Date().toString()}\n================================\n`;
        const data = csvStringToJsonObject(req.body.data);
        for(let i = 0; i < data.length; i++) {
            let member = data[i];
            if(!member.idp || !member.username || !member.role || !member.ne_behaviour) {
                log += `Invalid entry at line ${i}, missing required heading(s).\n`; continue;
            }
            // Check if an user with that name already exists
            let user = await User.findOne({idp: member.idp, username: member.username});
            if(!user) {
                if(member.ne_behaviour === 'ignore') {
                    log += `User indicated on line ${i} does not exist. And behaviour is set to ignore, skipping this record.\n`; continue;
                }
                user = await User.create(member.idp, member.username, member.password || "", "", [], {});
                log += `User indicated on line ${i} does not exist, created with ID ${user._id}.\n`;
            }
            if(member.role && member.role.match(/^tutorial\..*\.(student|ta|instructor)$/)) {
                // Get tutorial name
                let tutorialCode = member.role.split(".")[1];
                // Try to find the tutorial
                let tutorial: Container = await Container.findOne({name: course.name + ".tutorial." + tutorialCode});
                if(!tutorial) {
                    // Create the tutorial container
                    tutorial = await Container.create(
                        course.name + ".tutorial." + tutorialCode,
                        "admin", "admin", "admin",
                        {
                            _v: 1,
                            _name: tutorialCode,
                            _displayName: tutorialCode
                        }
                    );
                    log += `Tutorial indicated on line ${i} does not exist, created with ID ${tutorial._id}.\n`;
                }
                await user.addContainer(course, "." + member.role);
                log += `Role ${course.name}.${member.role} added for ${user.idp}.${user.username}.\n`;
                await user.addContainer(course, "." + member.role.split(".")[2]);
                log += `Role ${course.name}.${member.role.split(".")[2]} added for ${user.idp}.${user.username}.\n`;

            } else if (member.role && member.role.match(/^(ta|student|instructor)$/)) {
                await user.addContainer(course, "." + member.role);
                log += `Role ${course.name}.${member.role} added for ${user.idp}.${user.username}.\n`;
            } else {
                log += `[ERROR] Role on line ${i} is invalid [${member.role}], skipping this addition.\n`;
            }
        }
        res.header('content-type', 'text/plain');
        res.send(log);
    }

    /**
     * Update tutorial details
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async updateTutorialDetail(req: Request, res: Response): Promise<void> {
        let {tutorial} = await Container.getCourseAndTutorialOrFail(req.params.name, req.params.tutorial_name);
        // Update tutorial name
        if (req.body.name) {
            tutorial.content = {
                ...tutorial.content,
                _displayName: req.body.name
            };
        }
        await tutorial.save();
        res.redirectBackWithSuccess("Tutorial updated.");
    }

};
