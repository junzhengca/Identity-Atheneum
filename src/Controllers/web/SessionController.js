const getRealUrl = require('../../Util/getRealUrl');

class SessionController {
    /**
     * Get session overview page
     * @param req
     * @param res
     */
    static sessionPage(req, res) {
        if(req.user) {
            res.render('pages/session', {
                title: "Current Session",
                session: req.session,
                user: req.user
            });
        } else {
            res.redirect(getRealUrl('/login'));
        }
    }
}

module.exports = SessionController;
