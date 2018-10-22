const config = require('../config');

module.exports = function(url) {
    return config.host_root + url;
};
