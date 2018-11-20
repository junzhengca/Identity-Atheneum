// @flow

const config = require('../config');

/**
 * Returns the real absolute URL
 * @param url
 * @param _config
 * @returns {*}
 */
module.exports = function(url: string, _config: any = null): string {
    return (_config || config).host_root + url;
};
