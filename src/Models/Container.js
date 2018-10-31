const User = require('./User');
const mongoose = require('mongoose');

const containerSchema = new mongoose.Schema({
    name: String,
    writeGroups: String,
    readGroups: String,
    deleteGroups: String,
    content: mongoose.SchemaTypes.Mixed
}, {timestamps: true});

/**
 * Find one container or fail
 * @param filter
 * @returns {Promise<any>}
 */
containerSchema.statics.findOneOrFail = function(filter) {
    return new Promise((resolve, reject) => {
        this.findOne(filter)
            .then(container => {
                if(container) {
                    resolve(container);
                } else {
                    throw new Error("Container not found.");
                }
            })
            .catch(e => reject(e));
    });
};

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
 * Return if this container is a tutorial container
 * @returns {*}
 */
containerSchema.methods.isTutorial = function() {
    return this.name.match(/^course\..*\.tutorial\..*$/);
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

/**
 * Get a tutorial by course container name and tutorial container name
 * Make sure they match and resolve the tutorial container
 * @param courseContainerName
 * @param tutorialContainerName
 * @returns {Promise<any>}
 */
containerSchema.statics.getCourseAndTutorialOrFail = function(courseContainerName, tutorialContainerName) {
    return new Promise((resolve, reject) => {
        let course, tutorial;
        this.model('Container').findOne({name: courseContainerName})
            .then(result => {
                course = result;
                if(course && course.isCourse()) {
                    return course.getAllTutorials();
                } else {
                    throw new Error("Course not found.");
                }
            })
            .then(tutorials => {
                for(let i = 0; i < tutorials.length; i++) {
                    if(tutorials[i].name === tutorialContainerName) {
                        tutorial = tutorials[i];
                        break;
                    }
                }
                if(tutorial) {
                    resolve({course, tutorial});
                } else {
                    throw new Error("Tutorial not found.");
                }
            })
            .catch(e => {
                reject(e);
            })
    })
};

/**
 * Fetch all users that have access to this container
 * @returns {Promise<any>}
 */
containerSchema.methods.getAllUsers = function() {
    return new Promise((resolve, reject) => {
        User.find({groups: {$regex: new RegExp(this.name)}})
            .then(users => {
                resolve(users);
            })
            .catch(e => reject(e));
    })
};

module.exports  = mongoose.model('Container', containerSchema);
