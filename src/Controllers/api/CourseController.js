// @flow
/*-------------------------------------
 * Controller for Course
 *
 * Author(s): Jun Zheng
 --------------------------------------*/

// Models
const Container = require('../../Models/Container');

/**
 * Controller instance, mostly static
 * @type {module.CourseController}
 */
module.exports = class CourseController {
    /**
     * List all courses
     * @param req
     * @param res
     * @param next
     */
    static list(req: Request, res: express$Response, next: express$NextFunction) {
        if(req.application && req.isSecret) {
            let courses;
            Container.getAllCourses('_id name content._name content._displayName tutorials')
                .then(result => {
                    courses = result;
                    return Container.populateCoursesWithTutorials(courses, "_id name content._name content._displayName");
                })
                .then(() => {
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

    /**
     * Get one course
     * @param req
     * @param res
     * @param next
     */
    static get(req: Request, res: express$Response, next: express$NextFunction) {
        if(req.application && req.isSecret) {
            // Find a course
            let course;
            Container.findOneOrFail({_id: req.params.course_id})
                .then(result => {
                    course = result;
                    if(!course.isCourse()) throw new Error("Container is not a course.");
                    return Container.populateCoursesWithTutorials([course], "_id name content._name content._displayName");
                })
                .then(() => {
                    res.send(course);
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
     * Get a list of students enrolled within the course
     * @param req
     * @param res
     * @param next
     */
    static getStudents(req: Request, res: express$Response, next: express$NextFunction) {
        if(req.application && req.isSecret) {
            // Find a course
            let course;
            Container.findOneOrFail({_id: req.params.course_id})
                .then(result => {
                    course = result;
                    if(!course.isCourse()) throw new Error("Container is not a course.");
                    return course.getAllUsers('-attributes -__v');
                })
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
     * Get tutorials with in the course
     * @param req
     * @param res
     * @param next
     */
    static getTutorials(req: Request, res: express$Response, next: express$NextFunction) {
        if(req.application && req.isSecret) {
            // Find a course
            let course;
            Container.findOneOrFail({_id: req.params.course_id})
                .then(result => {
                    course = result;
                    if(!course.isCourse()) throw new Error("Container is not a course.");
                    return Container.populateCoursesWithTutorials([course], "_id name content._name content._displayName");
                })
                .then(() => {
                    res.send(course.tutorials);
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
     * Get tutorial detail
     * @param req
     * @param res
     * @param next
     */
    static getTutorial(req: Request, res: express$Response, next: express$NextFunction) {
        if(req.application && req.isSecret) {
            // Find a course
            let course;
            Container.getCourseAndTutorialOrFailById(req.params.course_id, req.params.tutorial_id)
                .then(result => {
                    res.send(result.tutorial);
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
     * Get all tutorial students
     * @param req
     * @param res
     * @param next
     */
    static getTutorialStudents(req: Request, res: express$Response, next: express$NextFunction) {
        if(req.application && req.isSecret) {
            // Find a course
            let course;
            Container.getCourseAndTutorialOrFailById(req.params.course_id, req.params.tutorial_id)
                .then(result => {
                    return result.tutorial.getAllUsers('-attributes -__v');
                })
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
};