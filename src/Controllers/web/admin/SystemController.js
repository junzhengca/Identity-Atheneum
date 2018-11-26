// @flow
/*-------------------------------------
 * Controller for Admin system page
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

const config = require('../../../config');

/**
 * Controller for systems page
 * @type {module.SystemController}
 */
module.exports = class SystemController {
    /**
     * GET /system
     * Get systems page
     * @param req
     * @param res
     */
    static systemPage(req: Request, res: Response): void {
        res.render('pages/admin/system', {config});
    }
};
