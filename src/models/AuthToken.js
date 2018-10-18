const mongoose = require('mongoose');

const authTokenSchema = new mongoose.Schema({
    userId: mongoose.SchemaTypes.ObjectId,
    tokenBody: String,
    applicationId: String
}, {timestamps: true});

module.exports  = mongoose.model('AuthToken', authTokenSchema);
