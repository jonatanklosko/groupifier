/**
 * Returns a copy of the object with the value at the specified path transformed by the update function.
 *
 * @param {Object} object
 * @param {Array} propertyChain
 * @param {Function} updater
 * @returns {Object}
 */
export const updateIn = (object, [property, ...properyChain], updater) =>
  properyChain.length === 0
    ? { ...object, [property]: updater(object[property]) }
    : { ...object, [property]: updateIn(object[property], properyChain, updater) };

/**
 * Returns a copy of the object with the value at the specified path set to the given one.
 *
 * @param {Object} object
 * @param {Array} propertyChain
 * @param {*} value
 * @returns {Object}
 */
export const setIn = (object, properyChain, value) =>
  updateIn(object, properyChain, () => value);

/**
 * Returns a copy of the object with the value at the specified path merged with the given one.
 *
 * @param {Object} object
 * @param {Array} propertyChain
 * @param {Object} newValue
 * @returns {Object}
 */
export const mergeIn = (object, properyChain, newValue) =>
  updateIn(object, properyChain, currentValue => ({ ...currentValue, ...newValue }));


export const getIn = (object, [property, ...propertyChain], defaultValue = null) =>
  object ? (
    propertyChain.length === 0
      ? (object.hasOwnProperty(property) ? object[property] : defaultValue)
      : getIn(object[property], propertyChain, defaultValue)
  ) : defaultValue;

export const differ = (obj1, obj2, propertyChain) =>
  getIn(obj1, propertyChain) !== getIn(obj2, propertyChain);
