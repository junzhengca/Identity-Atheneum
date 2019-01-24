module.exports = function() {
    return async function(req, res, next) {
        if (!req.user || !req.user.isAdmin()) {
            res.status(401);
            res.render('pages/errors/authenticationError', {
                message: 'You must be authenticated as an admin to see this resource.',
                req
            });
            return;
        }
        next();
    };
};
