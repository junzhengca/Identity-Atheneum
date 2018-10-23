const getRealUrl = require('../../Util/getRealUrl');

class LogoutController {
    /**
     * Run logout action, and redirect to login page
     * @param req
     * @param res
     */
    static logout(req, res) {
        req.logout();
        res.redirect(getRealUrl('/login'));
    }
}

module.exports = LogoutController;
