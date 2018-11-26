const assert = require('assert');
const getRealUrl = require('../lib/Util/getRealUrl');

describe('getRealUrl', () => {
    it('should return path it self if no host_root', () => {
        assert.equal(getRealUrl('/test', {host_root: ''}), '/test');
    });

    it('should return host_root plus path if host_root exist', () => {
        assert.equal(getRealUrl('/test', {host_root: 'localhost'}), 'localhost/test');
    })
});
