// @flow

/**
 * Returns the real absolute URL
 * @param url
 * @param _config
 * @returns {*}
 */
module.exports = function(url: string, _config: any = null): string {
    return (_config || require('../config')).host_root + url;
};
