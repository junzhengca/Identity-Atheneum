module.exports = function(req) {
    return {
        error: req.flash('error').concat(req.flash('errors')),
        success: req.flash('success')
    }
};