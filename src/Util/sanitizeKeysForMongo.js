module.exports = function(object) {
    let newObj = {};
    for (let key in object) {
        let newKey = key.replace(/\$/g, "&#36");
        newKey = newKey.replace(/\./g, "&#46");
        newObj[newKey] = JSON.stringify(object[key]);
    }
    return newObj;
};
