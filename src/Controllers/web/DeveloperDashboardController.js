const Application = require('../../Models/Application');
const getRealUrl = require('../../Util/getRealUrl');

class DeveloperDashboardController {
    /**
     * Get developer dashboard home page
     * @param req
     * @param res
     */
    static homePage(req, res) {
        // Fetch all applications
        Application.find({userId: req.user._id})
            .then(applications => {
                res.render("pages/developer", {
                    title: "Developer Dashboard",
                    user: req.user,
                    applications,
                    getRealUrl,
                    success: req.flash('success'),
                    error: req.flash('errors')
                })
            });
    }

}

module.exports = DeveloperDashboardController;
