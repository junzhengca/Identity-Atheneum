module.exports = function(app) {
    return function(req, res, next) {
        res.redirectBack = function() {
            let backURL = req.header('Referer') || '/';
            res.redirect(backURL);
        };

        res.redirectBackWithError = function(msg, url = null) {
            let backURL = req.header('Referer') || '/';
            req.flash("error", msg);
            res.redirect(url ? url : backURL);
        };

        res.redirectBackWithSuccess = function(msg, url = null) {
            let backURL = req.header('Referer') || '/';
            req.flash("success", msg);
            res.redirect(url ? url : backURL);
        };

        next();
    }
};
