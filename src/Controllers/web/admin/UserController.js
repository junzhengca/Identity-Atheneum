// @flow
/*-------------------------------------
 * Controller for Admin users page
 *
 * Author(s): Jun Zheng (me at jackzh dot com)
 --------------------------------------*/

const User             = require('../../../Models/User');
const NotFoundError    = require('../../../Errors/NotFoundError');
const getRealUrl       = require('../../../Util/getRealUrl');
const isValidGroupName = require('../../../Util/isValidGroupName');

/**
 * Controller for admin dashboard users page
 * @type {module.HomeController}
 */
module.exports = class UserController {
    /**
     * Render user listing page
     * @param req
     * @param res
     */
    static async usersPage(req: Request, res: Response) {
        let users = await User.find({
            idp: {$regex: req.query.idp || /.*/},
            groups: req.query.group ? {$regex: req.query.group || /.*/} : {$exists: true}
        });
        res.render('pages/admin/users', {
            title: "Users - Admin Dashboard",
            users
        });
    }

    /**
     * Render create new users page
     * @param req
     * @param res
     */
    static createNewUsersPage(req: Request, res: Response) {
        res.render('pages/admin/createUsers', {
            title: "Create New Users - Admin Dashboard"
        })
    }

    /**
     * Export user list in JSON format
     * @param req
     * @param res
     */
    static async exportUsersJSON(req: Request, res: Response) {
        let users = await User.find({});
        res.header('content-type', 'application/json');
        res.send(JSON.stringify(users));
    }

    /**
     * GET /users/detail/:identifier
     * Get user details page
     * @param req
     * @param res
     */
    static async userDetailPage(req: Request, res: Response) {
        let user = await User.findByIdentifier(req.params.identifier);
        if (user) {
            res.render('pages/admin/userDetail', {
                title: user.getReadableId() + " Detail - Admin Dashboard",
                user
            })
        } else {
            throw new NotFoundError("User not found.");
        }
    }

    /**
     * Create a list of users
     * @param req
     * @param res
     */
    static async createUsers(req: Request, res: Response) {
        // First get all users
        if (!req.body.users) {
            req.flash("errors", "You must have at least one user.");
            res.redirect(getRealUrl('/admin/users/create_users'));
        } else {
            // Parse every user
            let input = req.body.users.split(/\r?\n/);
            for (let i = 0; i < input.length; i++) {
                let line = input[i].split(/\s+/);
                if (line.length < 3) {
                    req.flash("errors", `Error on line ${i}, invalid number of arguments.`);
                } else {
                    try {
                        let user = await User.create(line[0], line[1], line[2], "", line.splice(3), {});
                        req.flash("success", `User created with ID ${user._id}.`);
                    } catch (e) {
                        req.flash("errors", e.message);
                    }
                }
            }
            res.redirect(getRealUrl('/admin/users/create_users'));
        }
    }

    /**
     * POST /users/detail/:identifier/add_group
     * Add a new group to user
     * @param req
     * @param res
     */
    static async addGroupToUser(req: Request, res: Response) {
        let user = await User.findByIdentifier(req.params.identifier);
        if (user) {
            if (!req.body.name) {
                req.flash("errors", "Name is a required field.");
            } else if (!isValidGroupName(req.body.name)) {
                req.flash("errors", "Group name is invalid.");
            } else if (user.groups.indexOf(req.body.name) >= 0) {
                req.flash("errors", "Group already exists.");
            } else {
                user.groups.push(req.body.name);
                await user.save();
                req.flash("success", "Group added.");
            }
            res.redirect(getRealUrl('/admin/users/detail/' + req.params.identifier));
        } else {
            throw new NotFoundError("User not found.");
        }
    }

    /**
     * POST /users/detail/:identifier/delete_group
     * Remove a group from user
     * @param req
     * @param res
     */
    static async deleteGroupFromUser(req: Request, res: Response) {
        let user = await User.findByIdentifier(req.params.identifier);
        if (user) {
            if (!req.body.name) {
                req.flash("errors", "You must enter a group name.");
                throw new Error("You must enter a group name.");
            } else if (user.groups.indexOf(req.body.name) < 0) {
                req.flash("errors", "Group does not exist");
                throw new Error("Group does not exist.");
            } else {
                let index = user.groups.indexOf(req.body.name);
                user.groups.splice(index, 1);
                await user.save();
                req.flash("success", "Group removed.");
            }
            res.redirect(getRealUrl('/admin/users/detail/' + req.params.identifier));
        } else {
            throw new NotFoundError("User not found.");
        }
    }

    /**
     * POST /users/detail/:identifier/delete
     * Delete an user
     * @param req
     * @param res
     */
    static async deleteUser(req: Request, res: Response) {
        let user = await User.findByIdentifier(req.params.identifier);
        if(user) {
            await user.remove();
            req.flash("success", "User removed.");
            res.redirect(getRealUrl('/admin/users'));
        } else {
            throw new NotFoundError("User not found.");
        }
    }
};
