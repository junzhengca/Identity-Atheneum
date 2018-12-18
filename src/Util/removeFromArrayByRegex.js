/**
 * Remove all items from an array that matches pattern given
 * @param arr
 * @param pattern
 * @returns {Array}
 */
function removeFromArrayByRegex(arr, pattern) {
    let newArr = [];
    arr.forEach(item => {
        console.log(item, pattern);
        if(!item.match(pattern)) {
            newArr.push(item);
        }
    });
    return newArr;
}

module.exports = removeFromArrayByRegex;
