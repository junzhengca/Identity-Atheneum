// @flow
/*-------------------------------------
 * Controller for User
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

import User from '../../Models/User';

/**
 * Controller instance, mostly static
 * @type {module.UserController}
 */
module.exports = class UserController {
    /**
     * List all users
     * @param req
     * @param res
     */
    static async list(req: any, res: any) {
        let users = await User.find({}).select('_id username idp');
        res.send(users);
    }

    /**
     * Get one user
     * @param req
     * @param res
     */
    static async get(req: any, res: any) {
        let user = await User.findOneOrFail({ _id: req.params.user_id });
        res.send(user);
    }

    /**
     * Get all courses
     * @param req
     * @param res
     */
    static async getCourses(req: any, res: any) {
        let user = await User.findOneOrFail({ _id: req.params.user_id });
        let courses = await user.getAllCourses('-__v');
        res.send(courses);
    }

    /**
     * Get all enrolled tutorials for a course
     * @param req
     * @param res
     */
    static async getCourseTutorials(req: any, res: any) {
        let user = await User.findOneOrFail({ _id: req.params.user_id });
        let tutorials = await user.getEnrolledTutorialsForCourse(req.params.course_id, '-__v');
        res.send(tutorials);
    }

    /**
     * Get current user
     * @param req
     * @param res
     */
    static getCurrent(req: any, res: any) {
        res.send(JSON.stringify(req.user));
    }
};
