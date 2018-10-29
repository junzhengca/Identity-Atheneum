const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: mongoose.SchemaTypes.ObjectId,
    groups: [String],
    name: String,
    assertionEndpoint: String
}, {timestamps: true});

/**
 * Create new application
 * @param userId
 * @param name
 * @param assertionEndpoint
 * @param groups
 * @returns {Promise<any>}
 */
applicationSchema.statics.create = function(userId, name, assertionEndpoint, groups) {
    return new Promise((resolve, reject) => {
        // First find the name
        this.findOne({name})
            .then(app => {
                if(app) {
                    throw new Error("Application with that name already exists.");
                }
                // Otherwise, create the application
                app = new this({
                    userId, name, assertionEndpoint, groups
                });
                return app.save();
            })
            .then(app => {
                resolve(app);
            })
            .catch(e => reject(e));
    });
};

applicationSchema.methods.isPreset = function() {
    if(this.name.match(/^ifcat.*$/)) {
        return true;
    }
    return false;
};

applicationSchema.methods.getPresetName = function() {
    if(this.name.match(/^ifcat.*$/)) {
        return "IFCAT";
    }
};

applicationSchema.methods.getPresetType = function() {
    if(this.name.match(/^ifcat.*$/)) {
        return "ifcat";
    }
};

module.exports  = mongoose.model('Application', applicationSchema);
