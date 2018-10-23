const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const util = require('util');
const pbkdf2 = util.promisify(require('pbkdf2').pbkdf2);

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
