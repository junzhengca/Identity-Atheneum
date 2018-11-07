const Container = require('../../Models/Container');

module.exports = class TutorialController {
    static list(req, res, next) {
        if(req.application && req.isSecret) {
            let courses;
            let tutorials = [];
            Container.getAllCourses('_id name content._name content._displayName tutorials')
                .then(result => {
                    courses = result;
                    return Container.populateCoursesWithTutorials(courses, "_id name content._name content._displayName");
                })
                .then(() => {
                    courses.forEach(course => {
                        tutorials.concat(course.tutorials);
                    });
                    res.send(tutorials);
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
