/**
 * Returns a new object with the given value at the specified path.
 * Doesn't modify the given object.
 *
 * @param {Object} object
 * @param {Array} propertyChain
 * @param {*} value
 * @returns {Object}
 */
export const setIn = (object, [property, ...properyChain], value) =>
  properyChain.length === 0
    ? { ...object, [property]: value }
    : { ...object, [property]: setIn(object[property], properyChain, value) };
