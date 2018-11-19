const ApplicationKey = require('../Models/ApplicationKey');
const Application = require('../Models/Application');

module.exports = function() {
    return function(req, res, next) {
        if(req.header("Authorization")) {
            let token = req.header("Authorization").split(" ")[1];
            ApplicationKey.findOneOrFail({secretKey: token})
                .then(key => {
                    return Application.findOne({_id: key.applicationId});
                })
                .then(application => {
                    req.application = application;
                    req.isSecret = true;
                    next();
                })
                .catch(() => {
                    next();
                })
        } else {
            next();
        }
    }
};
