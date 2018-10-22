module.exports = function(app) {
    return function(req, res, next) {
        let token = req.get("Authorization");
        req.isMaster = token === app.config.master_key;
        next();
    }
};
