module.exports = function() {
    return function(req, res, next) {
        if(!req.user || !req.user.isDeveloper()) {
            res.status(401);
            res.send("You must be authenticated as a developer to access this page.");
            return;
        }
        next();
    }
};
