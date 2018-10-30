const mongoose = require('mongoose');

const containerSchema = new mongoose.Schema({
    name: String,
    writeGroups: String,
    readGroups: String,
    deleteGroups: String,
    content: mongoose.SchemaTypes.Mixed
}, {timestamps: true});


/**
 * Create a new container
 * @param name
 * @param writeGroups
 * @param readGroups
 * @param deleteGroups
 * @param content
 * @returns {Promise<any>}
 */
containerSchema.statics.create = function(name, readGroups, writeGroups, deleteGroups, content = {}) {
    return new Promise((resolve, reject) => {
        if(!name.match(/^[0-9a-z.]+$/)) {
            return reject(new Error("Invalid container name."));
        }
        this.findOne({name})
            .then(container => {
                if(container) {
                    throw new Error("Container already exists.");
                }
                let newContainer = new this({name, writeGroups, readGroups, deleteGroups, content});
                return newContainer.save();
            })
            .then(container => {
                resolve(container);
            })
            .catch(e => reject(e));
    })
};

/**
 * Fetch all containers starts with course.
 * @returns {*}
 */
containerSchema.statics.getAllCourses = function() {
    return this.find({
        name: {$regex: /^course\.((?!\.).)*$/}
    })
};

/**
 * Get container version.
 * @returns {*}
 */
containerSchema.methods.getVersion = function() {
    return this.content ? this.content._v || "Unknown" : "Unknown";
};

/**
 * Get container name.
 * @returns {*}
 */
containerSchema.methods.getName = function() {
    return this.content ? this.content._name || "Unknown" : "Unknown";
};


/**
 * Get container display name.
 * @returns {*}
 */
containerSchema.methods.getDisplayName = function() {
    return this.content ? this.content._displayName || "Unknown" : "Unknown";
};

/**
 * Return if this container is a course container
 * @returns {*}
 */
containerSchema.methods.isCourse = function() {
    return this.name.match(/^course\.((?!\.).)*$/);
};

/**
 * Find all tutorials
 * @returns {Promise<any>}
 */
containerSchema.methods.getAllTutorials = function() {
    return new Promise((resolve, reject) => {
        if(!this.isCourse()) {
            return reject("Cannot get tutorials on a non-course container.");
        }
        // Find all tutorials
        this.model('Container').find({name: {$regex: new RegExp("^" + this.name + "\.tutorial\..*$")}})
            .then(tuts => resolve(tuts))
            .catch(e => reject(e));
    });
};

module.exports  = mongoose.model('Container', containerSchema);
