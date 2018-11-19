// @flow
/*-------------------------------------
 * Controller for Admin home page
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

const User = require('../../../Models/User');

/**
 * Controller for admin dashboard home
 * @type {module.HomeController}
 */
module.exports = class HomeController {
    /**
     * Render home page
     * @param req
     * @param res
     */
    static async homePage(req: Request, res: express$Response) {
        let users = await User.find({});
        res.render('pages/admin/home', {
            title: "Admin Dashboard",
            users
        });
    }
};
