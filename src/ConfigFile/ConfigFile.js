// @flow
const fs = require('fs');

class ConfigFile {

    path: string;

    constructor(path: string) {
        this.path = path;
    }

    /**
     * Read full file content into string
     */
    read(): string {
        return fs.readFileSync(this.path, 'utf8');
    }

    /**
     * Parse the configuration
     */
    parse(): any {}

    /**
     * Validate the configuration file
     */
    validate(): {errors: string[]} {
        let parsedData = this.parse();
        let errors = [];
        // Validate port
        if(!parsedData.port) {
            errors.push("[port] is a required configuration parameter, however it is not found.");
        } else {
            if(parsedData.port < 1 || parsedData.port > 65565) {
                errors.push(`${parsedData.port} is not a valid value for [port].`);
            }
        }
        // Validate host_root
        if(!parsedData.host_root) {
            errors.push("[host_root] is a required configuration parameter, however it is not found.");
        } else {
            if(!parsedData.host_root.match(/^http(s)?:\/\/[a-z-A-Z0-9.:\/]+$/)) {
                errors.push(`${parsedData.host_root} is not a valid value for [host_root].`);
            }
            if(parsedData.host_root.charAt(parsedData.host_root.length - 1) === '/') {
                errors.push("[host_root] cannot end with /.")
            }
        }
        // Validate Redis
        if(!parsedData.redis) {
            errors.push("[redis] is a required configuration parameter, however it is not found.");
        } else {
            if(!parsedData.redis.host) {
                errors.push("[redis.host] is a required configuration parameter, however it is not found.");
            }
            if(!parsedData.redis.port) {
                errors.push("[redis.port] is a required configuration parameter, however it is not found.");
            }
        }
        // Validate MongoDB
        if(!parsedData.mongo) {
            errors.push("[mongo] is a required configuration parameter, however it is not found.");
        } else {
            if(!parsedData.mongo.url) {
                errors.push("[mongo.url] is a required configuration parameter, however it is not found.");
            }
            if(!parsedData.mongo.url.match(/^mongodb:\/\/.*$/)) {
                errors.push(`${parsedData.mongo.url} is not a valid value for [mongo.url].`);
            }
        }
        // Validate app_secret
        if(!parsedData.app_secret) {
            errors.push("[app_secret] is a required configuration parameter, however it is not found.");
        }
        // Validate master_key
        if(!parsedData.master_key) {
            errors.push("[master_key] is a required configuration parameter, however it is not found.");
        }
        let localCount = 0;
        let samlCount = 0;
        // Validate identity_providers
        if(!parsedData.identity_providers) {
            errors.push("[identity_providers] is a required configuration parameter, however it is not found.");
        } else {
            if(parsedData.identity_providers.length < 1) {
                errors.push("You must have at least 1 identity provider, you have 0.");
            } else {
                // Loop through each IdP and validate
                parsedData.identity_providers.forEach((idp, key) => {
                    if(idp.type !== 'local' && idp.type !== 'saml') {
                        errors.push(`${idp.type} is not a valid IdP type, must be local or saml. (IdP ${key})`);
                    }
                    if(!idp.name) {
                        errors.push(`[name] is a required parameter for IdP, however it is not found. (IdP ${key})`);
                    }
                    if(!idp.display_name) {
                        errors.push(`[display_name] is a required parameter for IdP, however it is not found. (IdP ${key})`);
                    }
                    if(idp.type === 'local') {
                        localCount++;
                    }
                    // Additional validation for saml idps
                    if(idp.type === 'saml') {
                        samlCount++;
                        if(!idp.config) {
                            errors.push(`[config] is a required parameter for SAML IdP, however it is not found. (IdP ${key})`);
                        } else {
                            if(!idp.config.callback_url) {
                                errors.push(`[config.callback_url] is a required parameter for SAML IdP, however it is not found. (IdP ${key})`);
                            }
                            if(!idp.config.entry_point) {
                                errors.push(`[config.entry_point] is a required parameter for SAML IdP, however it is not found. (IdP ${key})`);
                            }
                            if(!idp.config.identifier_format) {
                                errors.push(`[config.identifier_format] is a required parameter for SAML IdP, however it is not found. (IdP ${key})`);
                            }
                            if(!idp.config.id_key) {
                                errors.push(`[config.id_key] is a required parameter for SAML IdP, however it is not found. (IdP ${key})`);
                            }
                            if(!idp.config.issuer) {
                                errors.push(`[config.issuer] is a required parameter for SAML IdP, however it is not found. (IdP ${key})`);
                            }
                            if(!idp.config.public_cert) {
                                errors.push(`[config.public_cert] is a required parameter for SAML IdP, however it is not found. (IdP ${key})`);
                            }
                            if(!idp.config.private_key) {
                                errors.push(`[config.private_key] is a required parameter for SAML IdP, however it is not found. (IdP ${key})`);
                            }
                            if(!idp.config.signature_algo) {
                                errors.push(`[config.signature_algo] is a required parameter for SAML IdP, however it is not found. (IdP ${key})`);
                            } else {
                                if(!idp.config.signature_algo.match(/^sha1|sha256|sha512$/)) {
                                    errors.push(`[config.signature_algo] must be sha1, sha256 or sha512. (IdP ${key})`);
                                }
                            }
                        }
                    }
                });
                // Check if we are overflow with IdPs
                if(localCount > 1) {
                    errors.push("You cannot have more than 1 local IdP.");
                }
                if(samlCount > 1) {
                    errors.push("You cannot have more than 1 SAML IdP.");
                }
            }
        }
        return {errors};
    }
}

module.exports = ConfigFile;
