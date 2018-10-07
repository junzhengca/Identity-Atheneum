const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    idp: String,
    username: String,
    salt: String,
    password: String,
    emailAddress: String,
    attributes: Schema.Types.Mixed
}, {timestamps: true});

module.exports  = mongoose.model('User', userSchema);
