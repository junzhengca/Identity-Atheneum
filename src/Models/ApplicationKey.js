const mongoose = require('mongoose');

const applicationKeySchema = new mongoose.Schema({
    applicationId: mongoose.SchemaTypes.ObjectId,
    publishableKey: String,
    secretKey: String
}, {timestamps: true});

module.exports  = mongoose.model('ApplicationKey', applicationKeySchema);