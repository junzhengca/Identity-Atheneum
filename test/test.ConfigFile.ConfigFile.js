const assert = require('assert');
const ConfigFile = require('../lib/ConfigFile/ConfigFile');
const YamlConfigFile = require('../lib/ConfigFile/YamlConfigFile');


describe('ConfigFile', () => {
    describe('#constructor()', () => {
        it('should set file path', () => {
            const file = new ConfigFile('test/sample.yml');
            assert.equal(file.path, 'test/sample.yml');
        });
    });
    describe('#read()', () => {
        it('should read the file content and return it as string', () => {
            const file = new ConfigFile('test/sample.yml');
            const data = file.read();
            assert.equal(data, 'port: 3000');
        })
    })
});

describe('YamlConfigFile', () => {
    describe('#parse()', () => {
        it('should parse the yaml content', () => {
            const file = new YamlConfigFile('test/sample.yml');
            const data = file.parse();
            assert.deepEqual(data, {port: 3000});
        });
        it('should throw error if yaml not valid', () => {
            const file = new YamlConfigFile('test/invalid.yml');
            assert.throws(file.parse, Error);
        })
    })
});
