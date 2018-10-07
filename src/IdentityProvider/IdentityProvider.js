// @flow

class IdentityProvider {
    config: ?mixed;

    constructor(config: ?mixed) {
        this.config = config;
    }

    initialize() {}

    mount(app: express$Application) {}
}

module.exports = IdentityProvider;
