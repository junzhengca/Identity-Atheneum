const mongoose = require('mongoose');

const containerSchema = new mongoose.Schema({
    name: String,
    writeGroups: String,
    readGroups: String,
    deleteGroups: String,
    content: mongoose.SchemaTypes.Mixed
}, {timestamps: true});


/**
 * Create a new container
 * @param name
 * @param writeGroups
 * @param readGroups
 * @param deleteGroups
 * @returns {Promise<any>}
 */
containerSchema.statics.create = function(name, readGroups, writeGroups, deleteGroups) {
    return new Promise((resolve, reject) => {
        if(!name.match(/^[0-9a-z.]+$/)) {
            return reject(new Error("Invalid container name."));
        }
        this.findOne({name})
            .then(container => {
                if(container) {
                    throw new Error("Container already exists.");
                }
                let newContainer = new this({name, writeGroups, readGroups, deleteGroups, content: {}});
                return newContainer.save();
            })
            .then(container => {
                resolve(container);
            })
            .catch(e => reject(e));
    })
};

containerSchema.statics.getAllCourses = function() {
    return this.find({
        name: {$regex: /^course\..*$/}
    })
};

containerSchema.methods.getVersion = function() {
    return this.content._v;
}



module.exports  = mongoose.model('Container', containerSchema);
