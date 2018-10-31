module.exports = class AuthStatusController {
    static getAuthStatus(req, res) {
        if(req.application && req.isSecret) {
            res.send({
                application: req.application,
                type: "secret_key"
            })
        } else {
            res.send({
                type: "not_authenticated"
            })
        }
    }
};
