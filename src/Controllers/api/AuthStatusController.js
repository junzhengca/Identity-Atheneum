// @flow
const AuthToken = require('../../Models/AuthToken');
const User = require('../../Models/User');

module.exports = class AuthStatusController {
    /**
     * Get application auth status
     */
    static getAuthStatus(req, res) {
        if (req.application && req.isSecret) {
            res.send({
                application: {
                    _id: req.application._id,
                    name: req.application.name
                },
                type: 'secret_key'
            });
        } else {
            res.send({
                type: 'not_authenticated'
            });
        }
    }

    /**
     * Populate an auth token
     */
    static populateAuthToken(req, res, next) {
        let token;
        if (req.application && req.isSecret) {
            AuthToken.findOneOrFail({ tokenBody: req.params.token_body, applicationId: req.application._id })
                .then(result => {
                    token = result;
                    return User.findOneOrFail({ _id: token.userId });
                })
                .then(user => {
                    res.send({
                        token,
                        user
                    });
                })
                .catch(e => next(e));
        } else {
            res.status(401);
            res.send('401');
        }
    }
};
