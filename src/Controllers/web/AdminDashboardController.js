const User                 = require('../../Models/User');
const Application          = require('../../Models/Application');
const ApplicationKey       = require('../../Models/ApplicationKey');
const Container            = require('../../Models/Container');
const getRealUrl           = require('../../Util/getRealUrl');
const isValidGroupName     = require('../../Util/isValidGroupName');
const flattenFlashMessages = require('../../Util/flattenFlashMessages');
const config               = require('../../config');
const NotFoundError        = require('../../Errors/NotFoundError');

module.exports = class AdminDashboardController {

    /**
     * Render applications page
     * @param req
     * @param res
     * @param next
     */
    static applicationsPage(req, res, next) {
        Application.find({})
            .populate('keys')
            .exec()
            .then(applications => {
                res.render('pages/admin/applications', {
                    applications,
                    req,
                    getRealUrl,
                    ...flattenFlashMessages(req)
                });
            });
    }

    /**
     * Delete an application
     * @param req
     * @param res
     */
    static deleteApplication(req, res) {
        Application.findOne({_id: req.params.id})
            .then(app => {
                if (!app) {
                    throw new Error("Application not found.");
                } else {
                    return app.remove();
                }
            })
            .then(() => {
                req.flash("success", "Application removed.");
                res.redirect(getRealUrl('/admin/applications'));
            })
            .catch(e => {
                req.flash("errors", e.message);
                res.redirect(getRealUrl('/admin/applications'));
            })
    }

    /**
     * Generate a new application key pair
     * @param req
     * @param res
     */
    static applicationGenerateKey(req, res) {
        Application.findOneOrFail({_id: req.body.id})
            .then(app => {
                return app.generateKey();
            })
            .then(key => {
                res.redirectBackWithSuccess("Key generated with ID " + key._id);
            })
            .catch(e => {
                res.redirectBackWithError("Failed to generate key. " + e.message);
            })
    }

    /**
     * Revoke an application key
     * @param req
     * @param res
     */
    static applicationRevokeKey(req, res) {
        ApplicationKey.findOneOrFail({_id: req.body.id})
            .then(key => {
                return key.remove();
            })
            .then(() => {
                res.redirectBackWithSuccess("Key revoked.");
            })
            .catch(e => {
                res.redirectBackWithError("Cannot find key. " + e.message);
            })
    }

    /**
     * GET /system
     * Get systems page
     * @param req
     * @param res
     */
    static systemPage(req, res) {
        res.render('pages/admin/system', {
            getRealUrl,
            config,
            ...flattenFlashMessages(req)
        });
    }

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

    /**
     * Render import application page
     * @param req
     * @param res
     */
    static importApplicationPage(req, res) {
        res.render('pages/admin/importApplication', {
            getRealUrl,
            ...flattenFlashMessages(req)
        });
    }

    /**
     * Actually import the application
     * @param req
     * @param res
     */
    static importApplication(req, res) {
        let data;
        try {
            data = JSON.parse(req.body.data);
        } catch (e) {
            req.flash("error", "Invalid JSON. Please check your request and try again.");
            return res.redirect(getRealUrl('/admin/applications/import'));
        }
        // Check data
        if (!data.name || !data.assertion_endpoint) {
            req.flash("error", "Invalid request. Please check your request and try again.");
            return res.redirect(getRealUrl('/admin/applications/import'));
        }
        // Actually have the valid request, attempt to create one with no group
        Application.create(req.user._id, data.name, data.assertion_endpoint, [])
            .then(app => {
                req.flash("success", "Application " + app._id + " registered.");
                return res.redirect(getRealUrl('/admin/applications'));
            })
            .catch(e => {
                req.flash("error", e.message);
                return res.redirect(getRealUrl('/admin/applications/import'));
            })
    }

};
