// @flow
import type Container from './Container';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const util = require('util');
const pbkdf2 = util.promisify(require('pbkdf2').pbkdf2);
const uuidv4 = require('uuid/v4');
const isValidMongoID = require('../Util/isValidMongoID');

const userSchema = new Schema(
    {
        idp: String,
        username: String,
        salt: String,
        password: String,
        emailAddress: String,
        groups: [String],
        attributes: Schema.Types.Mixed
    },
    { timestamps: true }
);

/**
 * Find user by identifier, id can be mongodb id, or idp.username format.
 * @param id
 * @returns {Promise<any>}
 */
userSchema.statics.findByIdentifier = function(id) {
    return new Promise((resolve, reject) => {
        // First check if it is a mongo ID
        if (isValidMongoID(id)) {
            // If it is, then we search using mongo id
            this.findOne({ _id: id })
                .then(user => resolve(user))
                .catch(e => reject(e));
        } else {
            // Otherwise, parse the ID
            id = id.split('.');
            if (id.length !== 2) {
                return reject(
                    'ID format is invalid, it must be either Mongo ID or idp.username.'
                );
            } else {
                this.findOne({ username: id[1], idp: id[0] })
                    .then(user => resolve(user))
                    .catch(e => reject(e));
            }
        }
    });
};

/**
 * Same as findByIdentifier, but throws an error if not found
 * @param id
 * @returns {Promise<any>}
 */
userSchema.statics.findByIdentifierOrFail = function(id) {
    return new Promise((resolve, reject) => {
        this.findByIdentifier(id)
            .then(user => {
                if (!user) throw new Error('User not found.');
                resolve(user);
            })
            .catch(e => reject(e));
    });
};

/**
 * Create a new user
 * @param idp
 * @param username
 * @param password
 * @param emailAddress
 * @param groups
 * @param attributes
 * @returns {Promise<any>}
 */
userSchema.statics.create = function(
    idp,
    username,
    password,
    emailAddress,
    groups,
    attributes
) {
    return new Promise((resolve, reject) => {
        let salt = uuidv4();
        let hashedPassword;
        this.findOne({ username, idp })
            .then(user => {
                if (user) {
                    throw new Error('Username already exists.');
                }
                return pbkdf2(password, salt, 1, 32, 'sha512');
            })
            .then(hashed => {
                hashedPassword = hashed.toString('hex');
            })
            .then(() => {
                let user = new this({
                    idp,
                    username,
                    salt,
                    password: hashedPassword,
                    emailAddress,
                    groups,
                    attributes
                });
                return user.save();
            })
            .then(user => {
                resolve(user);
            })
            .catch(e => reject(e));
    });
};

/**
 * Get human readable ID
 * @returns {string}
 */
userSchema.methods.getReadableId = function() {
    return this.idp + '.' + this.username;
};

/**
 * Returns a promise that resolves if the password match with database record
 * @param password
 * @returns {Promise<any>}
 */
userSchema.methods.verifyPassword = function(password) {
    return new Promise((resolve, reject) => {
        pbkdf2(password, this.salt, 1, 32, 'sha512')
            .then(hashed => {
                hashed = hashed.toString('hex');
                if (hashed === this.password) {
                    return resolve();
                } else {
                    throw new Error('Password not match.');
                }
            })
            .catch(e => reject(e));
    });
};

/**
 * Check if current user is a developer
 * @returns {*[]|{[p: string]: string}|Array|boolean}
 */
userSchema.methods.isDeveloper = function() {
    return this.groups && this.groups.indexOf('developer') > -1;
};

/**
 * Check if current user is admin
 * @returns {*[]|{[p: string]: string}|Array|boolean}
 */
userSchema.methods.isAdmin = function() {
    return this.groups && this.groups.indexOf('admin') > -1;
};

/**
 * Add new container to user
 * @param container
 * @param suffix
 * @returns {*}
 */
userSchema.methods.addContainer = async function(
    container: Container,
    suffix: string = ''
): Promise<void> {
    let index: number = this.groups.indexOf(container.name + suffix);
    if (index < 0) {
        this.groups.push(container.name + suffix);
        await this.save();
    }
};

/**
 * Remove user from container
 * @param container
 * @param suffix
 * @returns {Promise<any>}
 */
userSchema.methods.removeContainer = async function(
    container: Container,
    suffix: string = ''
): Promise<void> {
    let index: number = this.groups.indexOf(container.name + suffix);
    if (index > -1) {
        this.groups.splice(index, 1);
        await this.save();
    }
};

/**
 * Remove a container and all sub containers, for example
 * csca48 will remove csca48 and csca48.ta etc.
 * @param container
 * @param suffix
 * @returns {Promise<any>}
 */
userSchema.methods.removeContainerAndAllSubContainers = async function(
    container: Container,
    suffix: string = ''
): Promise<void> {
    let newGroups: string[] = [];
    this.groups.forEach(group => {
        if (!group.match(new RegExp(container.name + suffix)))
            newGroups.push(group);
    });
    this.groups = newGroups;
    await this.save();
};

userSchema.methods.getRolesByContainer = function(container) {
    let roles = [];
    this.groups.forEach(group => {
        if (group.match(new RegExp(`^${container.name}.*$`))) {
            roles.push(group.replace(container.name, ''));
        }
    });
    return roles;
};

userSchema.methods.getAllCourses = function(fields = null) {
    return new Promise((resolve, reject) => {
        let result = [];
        this.model('Container')
            .getAllCourses(fields)
            .then(courses => {
                if (this.isAdmin()) {
                    // If user is a global admin, then user is enrolled in all courses
                    resolve(courses);
                } else {
                    // Otherwise fetch courses that user is actually enrolled in
                    courses.forEach(course => {
                        this.groups.some(group => {
                            if (group.match(course.name)) {
                                result.push(course);
                                return true;
                            }
                        });
                    });
                    resolve(result);
                }
            })
            .catch(e => reject(e));
    });
};

userSchema.methods.getCourseOrFail = function(courseId, fields = null) {
    return new Promise((resolve, reject) => {
        let result;
        this.getAllCourses(fields)
            .then(courses => {
                courses.some(course => {
                    if (course._id.toString() === courseId.toString()) {
                        result = course;
                        return true;
                    }
                });
                if (result) resolve(result);
                else throw new Error('Course not found.');
            })
            .catch(e => reject(e));
    });
};

userSchema.methods.getEnrolledTutorialsForCourse = function(
    courseId,
    fields = null
) {
    return new Promise((resolve, reject) => {
        let result = [];
        this.getCourseOrFail(courseId)
            .then(course => {
                return course.getAllTutorials(fields);
            })
            .then(tutorials => {
                tutorials.forEach(tutorial => {
                    this.groups.some(group => {
                        if (group.match(tutorial.name)) {
                            result.push(tutorial);
                            return true;
                        }
                    });
                });
                resolve(result);
            })
            .catch(e => reject(e));
    });
};

module.exports = mongoose.model('User', userSchema);
