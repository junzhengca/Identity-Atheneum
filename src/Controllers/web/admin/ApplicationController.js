// @flow
/*-------------------------------------
 * Controller for Admin applications page
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

const Application    = require('../../../Models/Application');
const ApplicationKey = require('../../../Models/ApplicationKey');
const getRealUrl     = require('../../../Util/getRealUrl');

/**
 * Controller for applications page
 * @type {module.ApplicationController}
 */
module.exports = class ApplicationController {
    /**
     * Render applications page
     * @param req
     * @param res
     */
    static async applicationsPage(req: Request, res: Response): Promise<void> {
        let applications: Application[] = await Application.find({}).populate('keys').exec();
        res.render('pages/admin/applications', {applications});
    }

    /**
     * Delete an application
     * @param req
     * @param res
     */
    static async deleteApplication(req: Request, res: Response): Promise<void> {
        let application: Application = await Application.findOneOrFail({_id: req.params.id});
        await application.remove();
        req.flash("success", "Application removed.");
        res.redirect(getRealUrl('/admin/applications'));
    }

    /**
     * Render import application page
     * @param req
     * @param res
     */
    static importApplicationPage(req: Request, res: Response): void {
        res.render('pages/admin/importApplication');
    }

    /**
     * Actually import the application
     * @param req
     * @param res
     */
    static async importApplication(req: Request, res: Response): Promise<void> {
        let data;
        try {
            data = JSON.parse(req.body.data);
        } catch (e) {
            req.flash("error", "Invalid JSON. Please check your request and try again.");
            res.redirect(getRealUrl('/admin/applications/import'));
            return;
        }
        // Check data
        if (!data.name || !data.assertion_endpoint) {
            req.flash("error", "Invalid request. Please check your request and try again.");
            res.redirect(getRealUrl('/admin/applications/import'));
            return;
        }

        let application: Application = await Application.create(req.user._id, data.name, data.assertion_endpoint, []);
        req.flash("success", "Application " + application._id + " registered.");
        res.redirect(getRealUrl('/admin/applications'));
    }

    /**
     * Generate a new application key pair
     * @param req
     * @param res
     */
    static async applicationGenerateKey(req: Request, res: Response): Promise<void> {
        let application: Application = await Application.findOneOrFail({_id: req.body.id});
        let key                      = await application.generateKey();
        res.redirectBackWithSuccess("Key generated with ID " + key._id);
    }

    /**
     * Revoke an application key
     * @param req
     * @param res
     */
    static async applicationRevokeKey(req: Request, res: Response): Promise<void> {
        let key: ApplicationKey = await ApplicationKey.findOneOrFail({_id: req.body.id});
        await key.remove();
        res.redirectBackWithSuccess("Key revoked.");
    }
};
