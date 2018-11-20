// @flow
/*-------------------------------------
 * Controller for logout actions
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

const getRealUrl      = require('../../Util/getRealUrl');
const validator       = require('validator');
const BadRequestError = require('../../Errors/BadRequestError');

/**
 * Logout controller
 * @type {module.LogoutController}
 */
module.exports = class LogoutController {
    /**
     * Run logout action
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async logout(req: Request, res: Response): Promise<void> {
        if (req.query.callback && !validator.isURL(req.query.callback)) {
            throw new BadRequestError('Invalid callback URL provided.');
        }
        req.logout();
        if (req.query.callback) res.redirect(req.query.callback.toString());
        else res.redirect(getRealUrl('/login'));
    }
};
