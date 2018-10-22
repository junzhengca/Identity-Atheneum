const AuthToken = require('../Models/AuthToken');
const User = require('../Models/User');

module.exports = function() {
    return function(req, res, next) {
        if(req.header("Authorization")) {
            let token = req.header("Authorization").split(" ")[1];
            console.log(token);
            AuthToken.findOne({tokenBody: token})
                .then(authToken => {
                    if(authToken) {
                        return User.findOne({_id: authToken.userId});
                    }
                })
                .then(user => {
                    req.user = user;
                    next();
                })
                .catch(e => {
                    next(e);
                })
        }
    }
};
