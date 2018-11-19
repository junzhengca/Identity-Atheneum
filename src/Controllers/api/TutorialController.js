// @flow
/*-------------------------------------
 * Controller for Tutorial
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

const BadRequestError = require('../../Errors/BadRequestError');
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
    static async list(req: Request, res: express$Response) {
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
    static async get(req: Request, res: express$Response) {
        let tutorial = await Container.findOneOrFail({_id: req.params.tutorial_id});
        if (!tutorial.isTutorial()) {
            throw new BadRequestError("Container is not a tutorial.");
        }
        res.send(tutorial);
    }
};
