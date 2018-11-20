const mongoose = require('mongoose');
const ApplicationKey = require('./ApplicationKey');
const uuidv4 = require('uuid/v4');

const applicationSchema = new mongoose.Schema({
    userId: mongoose.SchemaTypes.ObjectId,
    groups: [String],
    name: String,
    assertionEndpoint: String
}, {timestamps: true});

// Application keys
applicationSchema.virtual('keys', {
    ref: 'ApplicationKey',
    localField: '_id',
    foreignField: 'applicationId',
});

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

/**
 * Generate a new key pair
 * @returns {Promise<any>}
 */
applicationSchema.methods.generateKey = function() {
    return new Promise((resolve, reject) => {
        let key = new ApplicationKey({
            applicationId: this._id,
            publishableKey: uuidv4(),
            secretKey: uuidv4()
        });
        key.save()
            .then(key => resolve(key))
            .catch(e => reject(e));
    });
};

module.exports  = mongoose.model('Application', applicationSchema);
