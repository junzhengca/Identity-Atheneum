const User = require('../../Models/User');
const getRealUrl = require('../../Util/getRealUrl');

module.exports = class AdminDashboardController {
    /**
     * Render home page
     * @param req
     * @param res
     */
    static homePage(req, res) {
        User.find({})
            .then(users => {
                res.render('pages/admin/home', {
                    title: "Admin Dashboard",
                    users,
                    getRealUrl
                });
            });
    }

    static usersPage(req, res) {
        User.find({
            idp: { $regex: req.query.idp || /.*/ },
            groups: { $regex: req.query.group || /.*/ }
        })
            .then(users => {
                res.render('pages/admin/users', {
                    title: "Users - Admin Dashboard",
                    users,
                    req,
                    getRealUrl
                });
            });
    }

    /**
     * Render create new users page
     * @param req
     * @param res
     */
    static createNewUsersPage(req, res) {
        res.render('pages/adminCreateNewUsers', {
            title: "Create New Users - Admin Dashboard",
            getRealUrl,
            success: req.flash('success'),
            error: req.flash('errors')
        })
    }

    /**
     * Create a list of users
     * @param req
     * @param res
     */
    static createUsers(req, res) {
        // First get all users
        if(!req.body.users) {
            req.flash("errors", "You must have at least one user.");
            res.redirect(getRealUrl('/admin/create_users'));
        } else {
            let chain = [];
            // Parse every user
            let input = req.body.users.split(/\r?\n/);
            for(let i = 0; i < input.length; i++) {
                let line = input[i].split(/\s+/);
                chain.push(new Promise((resolve, reject) => {
                    if(line.length < 3) {
                        req.flash("errors", `Error on line ${i}, invalid number of arguments.`);
                        return resolve();
                    }
                    // Otherwise we create the user
                    User.create(line[0], line[1], line[2], "", line.splice(3), {})
                        .then(user => {
                            req.flash("success", `User created with ID ${user._id}.`);
                            resolve();
                        })
                        .catch(e => {
                            req.flash("errors", e.message);
                            resolve();
                        })
                }));
            }
            Promise.all(chain)
                .then(() => {
                    res.redirect(getRealUrl('/admin/create_users'));
                })
                .catch(e => {
                    res.redirect(getRealUrl('/admin/create_users'));
                })
        }
    }

    /**
     * Export user list in JSON format
     * @param req
     * @param res
     * @param next
     */
    static exportUsersJSON(req, res, next) {
        User.find({})
            .then(users => {
                res.header('content-type', 'application/json');
                res.send(JSON.stringify(users));
            })
            .catch(e => next(e));
    }
};
