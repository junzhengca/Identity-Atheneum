// @flow
/*-------------------------------------
 * Controller for Course
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

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
     */
    static async list(req: Request, res: Response): Promise<void> {
        let courses = await Container.getAllCourses('_id name content._name content._displayName tutorials');
        await Container.populateCoursesWithTutorials(courses, '_id name content._name content._displayName');
        res.send(courses);
    }

    /**
     * Get one course
     * @param req
     * @param res
     */
    static async get(req: Request, res: Response): Promise<void> {
        let course = await Container.findOneCourseOrFail({ _id: req.params.course_id });
        await Container.populateCoursesWithTutorials([course], '_id name content._name content._displayName');
        res.send(course);
    }

    /**
     * Get a list of students enrolled within the course
     * @param req
     * @param res
     */
    static async getStudents(req: Request, res: Response): Promise<void> {
        let course = await Container.findOneCourseOrFail({ _id: req.params.course_id });
        let users = await course.getAllStudents('-attributes -__v');
        res.send(users);
    }

    /**
     * Get a list of TAs enrolled within the course
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async getTAs(req: Request, res: Response): Promise<void> {
        let course = await Container.findOneCourseOrFail({ _id: req.params.course_id });
        let users = await course.getAllTAs('-attributes -__v');
        res.send(users);
    }

    /**
     * Get a list of instructors enrolled within the course
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async getInstructors(req: Request, res: Response): Promise<void> {
        let course = await Container.findOneCourseOrFail({ _id: req.params.course_id });
        let users = await course.getAllInstructors('-attributes -__v');
        res.send(users);
    }

    /**
     * Get tutorials with in the course
     * @param req
     * @param res
     */
    static async getTutorials(req: Request, res: Response): Promise<void> {
        let course = await Container.findOneCourseOrFail({ _id: req.params.course_id });
        await Container.populateCoursesWithTutorials([course], '_id name content._name content._displayName');
        res.send(course.tutorials);
    }

    /**
     * Get tutorial detail
     * @param req
     * @param res
     */
    static async getTutorial(req: Request, res: Response): Promise<void> {
        let result = await Container.getCourseAndTutorialOrFailById(req.params.course_id, req.params.tutorial_id);
        res.send(result.tutorial);
    }

    /**
     * Get all tutorial students
     * @param req
     * @param res
     */
    static async getTutorialStudents(req: Request, res: Response): Promise<void> {
        let result = await Container.getCourseAndTutorialOrFailById(req.params.course_id, req.params.tutorial_id);
        let users = await result.tutorial.getAllStudents('-attributes -__v');
        res.send(users);
    }

    /**
     * Get all tutorial instructors
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async getTutorialTAs(req: Request, res: Response): Promise<void> {
        let result = await Container.getCourseAndTutorialOrFailById(req.params.course_id, req.params.tutorial_id);
        let users = await result.tutorial.getAllTAs('-attributes -__v');
        res.send(users);
    }

    /**
     * Get all tutorial instructors
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async getTutorialInstructors(req: Request, res: Response): Promise<void> {
        let result = await Container.getCourseAndTutorialOrFailById(req.params.course_id, req.params.tutorial_id);
        let users = await result.tutorial.getAllInstructors('-attributes -__v');
        res.send(users);
    }
};
