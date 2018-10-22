const Application = require('../../models/Application');
const getRealUrl = require('../../util/getRealUrl');

class ApplicationController {

    static _backToAddPage(res) {
        res.redirect(getRealUrl("/developer/add_registration"));
    }

    static _backToDashboard(res) {
        res.redirect(getRealUrl("/developer"));
    }

    /**
     * GET new registration page
     * @param req
     * @param res
     */
    static addPage(req, res) {
        res.render("pages/developerAddRegistration", {
            title: "Add Registration - Developer Dashboard",
            user: req.user,
            error: req.flash('error')
        })
    }

    /**
     * POST add a new app
     * @param req
     * @param res
     */
    static add(req, res) {
        // Make sure we have everything
        if(req.body.name && req.body.assertion_endpoint) {
            // Add the application into database
            let app = new Application({
                userId: req.user._id,
                name: req.body.name,
                assertionEndpoint: req.body.assertion_endpoint
            });
            app.save()
                .then(app => {
                    req.flash('success', 'Application created with ID ' + app._id.toString());
                    res.redirect(getRealUrl('/developer'));
                })
                .catch(e => {
                    req.flash('error', 'Unknown Error: ' + JSON.stringify(e));
                    ApplicationController._backToAddPage(res);
                })
        } else {
            req.flash('error', 'Name and Assertion Endpoint are required parameters.');
            ApplicationController._backToAddPage(res);
        }
    }

    static remove(req, res) {
        if(req.body.id) {
            // Find the app
            Application.findOne({_id: req.body.id, userId: req.user._id})
                .then(app => {
                    if(!app) {
                        throw new Error("You are either not authorized to remove this registration, or registration not found.");
                    } else {
                        return app.remove();
                    }
                })
                .then(() => {
                    req.flash('success', 'Application removed.');
                    ApplicationController._backToDashboard(res);
                })
                .catch(e => {
                    req.flash('error', e.message);
                    ApplicationController._backToDashboard(res);
                });
        } else {
            req.flash('error', 'Application ID is required.');
            ApplicationController._backToDashboard(res);
        }
    }
}

module.exports = ApplicationController;
