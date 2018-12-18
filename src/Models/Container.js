// @flow
const User                   = require('./User');
const mongoose               = require('mongoose');
const BadRequestError        = require('../Errors/BadRequestError');
const asyncForEach           = require('../Util/asyncForEach');
const removeFromArrayByRegex = require('../Util/removeFromArrayByRegex');

const containerSchema = new mongoose.Schema({
    name: String,
    writeGroups: String,
    readGroups: String,
    deleteGroups: String,
    content: mongoose.Schema.Types.Mixed,
}, {
    timestamps: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

containerSchema.virtual('tutorials').get(function () {
    return this._tutorials;
}).set(function (v) {
    this._tutorials = v;
});

containerSchema.virtual('courseName').get(function () {
    return this.getName();
});

containerSchema.virtual('courseDisplayName').get(function () {
    return this.getDisplayName();
});


/**
 * Create a new container
 * @param name
 * @param writeGroups
 * @param readGroups
 * @param deleteGroups
 * @param content
 * @returns {Promise<any>}
 */
containerSchema.statics.create = function (name, readGroups, writeGroups, deleteGroups, content = {}) {
    return new Promise((resolve, reject) => {
        if (!name.match(/^[0-9a-z.]+$/)) {
            return reject(new Error("Invalid container name."));
        }
        this.findOne({name})
            .then(container => {
                if (container) {
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
containerSchema.statics.getAllCourses = function (fields = null) {
    return this.find({
        name: {$regex: /^course\.((?!\.).)*$/}
    }).select(fields).exec();
};

/**
 * Get one course or fail
 * @param filter
 * @returns {Promise<Container>}
 */
containerSchema.statics.findOneCourseOrFail = async function (filter) {
    let course = await this.findOneOrFail(filter);
    if (!course.isCourse()) throw new BadRequestError("Course not found.");
    return course;
};

/**
 * Get one tutorial or fail
 * @param filter
 * @returns {Promise<Container>}
 */
containerSchema.statics.findOneTutorialOrFail = async function (filter) {
    let tutorial = await this.findOneOrFail(filter);
    if (!tutorial.isTutorial()) throw new BadRequestError("Tutorial not found.");
    return tutorial;
};

/**
 * Get a list of courses, populate them with tutorials
 * @param courses
 * @param fields
 * @returns {Promise<any[]>}
 */
containerSchema.statics.populateCoursesWithTutorials = function (courses, fields = null) {
    let chain = [];
    Object.keys(courses).forEach(key => {
        if (courses[key].isCourse()) {
            chain.push(new Promise((resolve, reject) => {
                courses[key].getAllTutorials(fields)
                    .then(tuts => {
                        courses[key].set('tutorials', tuts);
                        resolve();
                    })
                    .catch(e => reject(e));
            }))
        }
    });
    return Promise.all(chain);
};

/**
 * Get container version.
 * @returns {*}
 */
containerSchema.methods.getVersion = function () {
    return this.content ? this.content._v || "Unknown" : "Unknown";
};

/**
 * Get container name.
 * @returns {*}
 */
containerSchema.methods.getName = function () {
    return this.content ? (this.content._name || "Unknown") : "Unknown";
};


/**
 * Get container display name.
 * @returns {*}
 */
containerSchema.methods.getDisplayName = function () {
    return this.content ? this.content._displayName || "Unknown" : "Unknown";
};

/**
 * Return if this container is a course container
 * @returns {*}
 */
containerSchema.methods.isCourse = function () {
    return this.name.match(/^course\.((?!\.).)*$/);
};

/**
 * Return if this container is a tutorial container
 * @returns {*}
 */
containerSchema.methods.isTutorial = function () {
    return this.name.match(/^course\..*\.tutorial\..*$/);
};

/**
 * Find all tutorials
 * @returns {Promise<any>}
 */
containerSchema.methods.getAllTutorials = function (fields = null) {
    return new Promise((resolve, reject) => {
        if (!this.isCourse()) {
            return reject("Cannot get tutorials on a non-course container.");
        }
        // Find all tutorials
        this.model('Container')
            .find({name: {$regex: new RegExp("^" + this.name + "\.tutorial\..*$")}})
            .select(fields)
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
containerSchema.statics.getCourseAndTutorialOrFail = function (courseContainerName, tutorialContainerName) {
    return new Promise((resolve, reject) => {
        let course, tutorial;
        this.model('Container').findOne({name: courseContainerName})
            .then(result => {
                course = result;
                if (course && course.isCourse()) {
                    return course.getAllTutorials();
                } else {
                    throw new Error("Course not found.");
                }
            })
            .then(tutorials => {
                for (let i = 0; i < tutorials.length; i++) {
                    if (tutorials[i].name === tutorialContainerName) {
                        tutorial = tutorials[i];
                        break;
                    }
                }
                if (tutorial) {
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
 * Get a tutorial by course container id and tutorial container id
 * Make sure they match and resolve the tutorial container
 * @param courseContainerId
 * @param tutorialContainerId
 * @returns {Promise<any>}
 */
containerSchema.statics.getCourseAndTutorialOrFailById = function (courseContainerId, tutorialContainerId) {
    return new Promise((resolve, reject) => {
        let course, tutorial;
        this.model('Container').findOne({_id: courseContainerId})
            .then(result => {
                course = result;
                if (course && course.isCourse()) {
                    return course.getAllTutorials();
                } else {
                    throw new Error("Course not found.");
                }
            })
            .then(tutorials => {
                for (let i = 0; i < tutorials.length; i++) {
                    if (tutorials[i]._id.toString() === tutorialContainerId.toString()) {
                        tutorial = tutorials[i];
                        break;
                    }
                }
                if (tutorial) {
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
 * Get all students enrolled in the course
 * @param fields
 * @returns {Promise<User[]>}
 */
containerSchema.methods.getAllStudents = async function (fields: ?String = null): Promise<User[]> {
    return await User.find({groups: {$regex: new RegExp(`^${this.name}\.student$`)}}).select(fields);
};

/**
 * Get all TAs enrolled in the course
 * @param fields
 * @returns {Promise<*>}
 */
containerSchema.methods.getAllTAs = async function (fields = null) {
    return await User.find({groups: {$regex: new RegExp(`^${this.name}\.ta$`)}}).select(fields);
};

/**
 * Get all instructors enrolled in the course
 * @param fields
 * @returns {Promise<*>}
 */
containerSchema.methods.getAllInstructors = async function (fields = null) {
    return await User.find({groups: {$regex: new RegExp(`^${this.name}\.instructor$`)}}).select(fields);
};

/**
 * Get all users enrolled in the course
 * @param fields
 * @returns {Promise<User[]>}
 */
containerSchema.methods.getAllUsers = async function (fields: ?String = null): Promise<User[]> {
    return await User.find({groups: {$regex: new RegExp(`^${this.name}.*$`)}}).select(fields);
};


/**
 * Remove the container and all its dependencies
 * @returns {Promise<void>}
 */
containerSchema.methods.deleteAndCleanup = async function (): Promise<void> {
    if (this.isTutorial()) {
        // Run tutorial removal actions
        let users = await this.getAllUsers();
        await asyncForEach(users, async (user) => {
            // Remove all groups related to this container from this user
            user.groups = removeFromArrayByRegex(user.groups, new RegExp(`^${this.name}.*$`));
            await user.save();
        });
        this.remove();
    }
};

module.exports = mongoose.model('Container', containerSchema);
