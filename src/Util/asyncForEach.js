/**
 * Run sequential async actions on an array of items.
 * @param items
 * @param cb
 * @returns {Promise<void>}
 */
async function asyncForEach(items, cb) {
    for(let i = 0; i < items.length; ++i) {
        await cb(items[i], i);
    }
}

module.exports = asyncForEach;
