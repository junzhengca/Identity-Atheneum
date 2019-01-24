// @flow
/*-------------------------------------
 * Controller for Admin containers page
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

const Container = require('../../../Models/Container');
const getRealUrl = require('../../../Util/getRealUrl');

/**
 * Controller for container page
 * @type {module.SystemController}
 */
module.exports = class ContainerController {
    /**
     * GET /containers
     * Render containers page
     * @param req
     * @param res
     */
    static async containersPage(req: any, res: any): Promise<void> {
        let containers: Container[] = await Container.find({});
        res.render('pages/admin/containers', { containers });
    }

    /**
     * GET /containers/create_container
     * Render create container page
     * @param req
     * @param res
     */
    static createContainerPage(req: any, res: any): void {
        res.render('pages/admin/createContainer');
    }

    /**
     * POST /containers/create_container
     * Create a new container
     * @param req
     * @param res
     */
    static async createContainer(req: any, res: any): Promise<void> {
        let container: Container = await Container.create(
            req.body.name,
            req.body.read_groups,
            req.body.write_groups,
            req.body.delete_groups
        );
        req.flash('success', 'Container created ' + container._id + '.');
        res.redirect(getRealUrl('/admin/containers'));
    }

    /**
     * GET /containers/detail/:name
     * Render container details page
     * @param req
     * @param res
     */
    static async containerDetailPage(req: any, res: any): Promise<void> {
        let container: Container = await Container.findOneOrFail({ name: req.params.name });
        res.render('pages/admin/containerDetail', { container });
    }

    /**
     * Export container into JSON format
     * @param req
     * @param res
     */
    static async exportContainerJSON(req: any, res: any): Promise<void> {
        let container: Container = await Container.findOneOrFail({ name: req.params.name });
        res.header('content-type', 'application/json');
        res.send(JSON.stringify(container));
    }

    /**
     * Update container detail
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async updateContainerDetail(req: any, res: any): Promise<void> {
        let container: Container = await Container.findOneOrFail({ name: req.params.name });
        if (req.body.readGroups) container.readGroups = req.body.readGroups;
        if (req.body.writeGroups) container.writeGroups = req.body.writeGroups;
        if (req.body.deleteGroups) container.deleteGroups = req.body.deleteGroups;
        await container.save();
        res.redirectBackWithSuccess('Container updated.');
    }
};
