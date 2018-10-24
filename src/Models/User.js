const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const util = require('util');
const pbkdf2 = util.promisify(require('pbkdf2').pbkdf2);
const uuidv4 = require('uuid/v4');

const userSchema = new Schema({
    idp: String,
    username: String,
    salt: String,
    password: String,
    emailAddress: String,
    groups: [String],
    attributes: Schema.Types.Mixed
}, {timestamps: true});

/**
 * Find user by identifier, id can be mongodb id, or idp.username format.
 * @param id
 * @returns {Promise<any>}
 */
userSchema.statics.findByIdentifier = function(id) {
    return new Promise((resolve, reject) => {

    })
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
userSchema.statics.create = function(idp, username, password, emailAddress, groups, attributes) {
    return new Promise((resolve, reject) => {
        let salt = uuidv4();
        let hashedPassword;
        this.findOne({username, idp})
            .then(user => {
                if(user) {
                    throw new Error("Username already exists.");
                }
                return pbkdf2(password, salt, 1, 32, 'sha512');
            })
            .then(hashed => {
                hashedPassword = hashed.toString('hex');
            })
            .then(() => {
                let user = new this({
                    idp, username, salt, password: hashedPassword, emailAddress, groups, attributes
                });
                return user.save();
            })
            .then(user => {
                resolve(user);
            })
            .catch(e => reject(e));
    })
};

/**
 * Returns a promise that resolves if the password match with database record
 * @param password
 * @returns {Promise<any>}
 */
userSchema.methods.verifyPassword = function (password) {
    return new Promise((resolve, reject) => {
        pbkdf2(password, this.salt, 1, 32, 'sha512')
            .then(hashed => {
                hashed = hashed.toString('hex');
                if(hashed === this.password) {
                    return resolve();
                } else {
                    throw new Error("Password not match.");
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
    return this.groups && this.groups.indexOf("developer") > -1;
};

/**
 * Check if current user is admin
 * @returns {*[]|{[p: string]: string}|Array|boolean}
 */
userSchema.methods.isAdmin = function() {
    return this.groups && this.groups.indexOf("admin") > -1;
};

module.exports  = mongoose.model('User', userSchema);
