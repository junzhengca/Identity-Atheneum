const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: mongoose.SchemaTypes.ObjectId,
    name: String,
    assertionEndpoint: String
}, {timestamps: true});

module.exports  = mongoose.model('Application', applicationSchema);
