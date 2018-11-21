// @flow
/*-------------------------------------
 * Controller for Tutorial
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

import type User from '../../Models/User';

const Container       = require('../../Models/Container');

/**
 * Controller instance, mostly static
 * @type {module.TutorialController}
 */
module.exports = class TutorialController {
    /**
     * List all tutorials
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async list(req: Request, res: Response): Promise<void> {
        let courses = await Container.getAllCourses('_id name content._name content._displayName tutorials');
        await Container.populateCoursesWithTutorials(courses, "_id name content._name content._displayName");
        let tutorials = [];
        courses.forEach(course => {
            tutorials = tutorials.concat(course.tutorials);
        });
        res.send(tutorials);
    }

    /**
     * Get one tutorial
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async get(req: Request, res: Response): Promise<void> {
        let tutorial: Container = await Container.findOneTutorialOrFail({_id: req.params.tutorial_id});
        res.send(tutorial);
    }

    /**
     * Get all students within a tutorial
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async getStudents(req: Request, res: Response): Promise<void> {
        let tutorial: Container = await Container.findOneTutorialOrFail({_id: req.params.tutorial_id});
        let users: User[] = await tutorial.getAllStudents();
        res.send(users);
    }

    /**
     * Get all TAs within a tutorial
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async getTAs(req: Request, res: Response): Promise<void> {
        let tutorial: Container = await Container.findOneTutorialOrFail({_id: req.params.tutorial_id});
        let users: User[] = await tutorial.getAllTAs();
        res.send(users);
    }

    /**
     * Get all TAs within a tutorial
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async getInstructors(req: Request, res: Response): Promise<void> {
        let tutorial: Container = await Container.findOneTutorialOrFail({_id: req.params.tutorial_id});
        let users: User[] = await tutorial.getAllInstructors();
        res.send(users);
    }

};
