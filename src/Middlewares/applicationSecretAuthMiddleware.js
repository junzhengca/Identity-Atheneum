/**
 * Middleware that returns 401 if not authenticated as application secret key
 * @returns {Function}
 */
module.exports = function() {
    return function(req, res, next) {
        if(req.application && req.isSecret) {
            next();
        } else {
            res.status(401);
            res.send("401, you are not authorized to use this endpoint. You must provide an application secret key.");
        }
    }
};
