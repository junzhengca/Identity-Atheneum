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
     * @returns {Promise<void>}
     */
    static async homePage(req: any, res: any) {
        res.render('pages/admin/home', {
            title: 'Admin Dashboard'
        });
    }

    /**
     * Render advanced home page
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async homeAdvancedPage(req: any, res: any) {
        res.render('pages/admin/homeAdvanced', {
            title: 'Advanced Options'
        });
    }
};
