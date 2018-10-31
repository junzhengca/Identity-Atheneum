const mongoose = require('mongoose');

const authTokenSchema = new mongoose.Schema({
    userId: mongoose.SchemaTypes.ObjectId,
    tokenBody: String,
    applicationId: mongoose.SchemaTypes.ObjectId
}, {timestamps: true});

module.exports  = mongoose.model('AuthToken', authTokenSchema);
