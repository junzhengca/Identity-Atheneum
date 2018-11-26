const csv = require('csv-string');

module.exports = function(str) {
    let arr = csv.parse(str);
    // Loop through array and construct objects
    if(arr.length < 1) {
        throw new Error("You must have at least 1 row.");
    }
    let header = [...arr[0]];
    arr.shift();
    let result = [];
    arr.forEach(row => {
        if(row.length > header.length) {
            throw new Error("Invalid row, item overflow.");
        }
        let obj = {};
        row.forEach((item, key) => {
            obj[header[key]] = item;
        });
        result.push(obj);
    });
    return result;
};
