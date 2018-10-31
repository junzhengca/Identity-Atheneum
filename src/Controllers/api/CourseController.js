const Container = require('../../Models/Container');

module.exports = class CourseController {
    /**
     * List all courses
     * @param req
     * @param res
     * @param next
     */
    static list(req, res, next) {
        if(req.application && req.isSecret) {
            let courses;
            Container.getAllCourses()
                .select('_id name content._name content._displayName tutorials')
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
};