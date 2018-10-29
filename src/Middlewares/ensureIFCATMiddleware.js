const Application = require('../Models/Application');

module.exports = function() {
    return function(req, res, next) {
        console.log(req);
        Application.findOne({_id: req.params.id})
            .then(app => {
                if(!app) {
                    res.send("Application with that ID cannot be found.");
                } else if (!app.name.match(/^ifcat.*$/)) {
                    res.send("Application is not an IFCAT instance.");
                } else {
                    req.application = app;
                    next();
                }
            })
            .catch(e => {
                res.send("Unexpected error. " + e.message);
            })
    }
};
