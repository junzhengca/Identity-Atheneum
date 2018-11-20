const Container            = require('../../Models/Container');
const getRealUrl           = require('../../Util/getRealUrl');
const flattenFlashMessages = require('../../Util/flattenFlashMessages');

module.exports = class AdminDashboardController {

    /**
     * GET /containers
     * Render containers page
     * @param req
     * @param res
     */
    static containersPage(req, res) {
        Container.find({})
            .then(containers => {
                res.render('pages/admin/containers', {
                    getRealUrl,
                    containers,
                    ...flattenFlashMessages(req)
                })
            });
    }

    /**
     * GET /containers/create_container
     * Render create container page
     * @param req
     * @param res
     */
    static createContainerPage(req, res) {
        res.render('pages/admin/createContainer', {
            getRealUrl,
            ...flattenFlashMessages(req)
        })
    }

    /**
     * POST /containers/create_container
     * Create a new container
     * @param req
     * @param res
     */
    static createContainer(req, res) {
        Container.create(req.body.name, req.body.read_groups, req.body.write_groups, req.body.delete_groups)
            .then(container => {
                req.flash("success", "Container created " + container._id + ".");
                res.redirect(getRealUrl('/admin/containers'));
            })
            .catch(e => {
                req.flash("errors", e.message);
                res.redirect(getRealUrl('/admin/containers'));
            })
    }

    /**
     * GET /containers/detail/:name
     * Render container details page
     * @param req
     * @param res
     */
    static containerDetailPage(req, res) {
        Container.findOne({name: req.params.name})
            .then(container => {
                if (container) {
                    res.render('pages/admin/containerDetail', {
                        getRealUrl,
                        container,
                        ...flattenFlashMessages(req)
                    });
                } else {
                    res.send("Container not found.");
                }
            })
    }

    /**
     * Export container into JSON format
     * @param req
     * @param res
     */
    static exportContainerJSON(req, res) {
        Container.findOne({name: req.params.name})
            .then(container => {
                if (container) {
                    res.header('content-type', 'application/json');
                    res.send(JSON.stringify(container));
                } else {
                    res.send("Container not found.");
                }
            })
    }

};
