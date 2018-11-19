// @flow

const config = require('../config');

/**
 * Returns the real absolute URL
 * @param url
 * @returns {*}
 */
module.exports = function(url: string): string {
    return config.host_root + url;
};
