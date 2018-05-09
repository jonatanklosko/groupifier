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


/**
 * Returns object's value at the specified path or the default value if it doesn't exist.
 *
 * @param {Object} object
 * @param {Array} propertyChain
 * @param {*} defaultValue
 * @returns {*}
 */
export const getIn = (object, [property, ...propertyChain], defaultValue = null) =>
  object ? (
    propertyChain.length === 0
      ? (object.hasOwnProperty(property) ? object[property] : defaultValue)
      : getIn(object[property], propertyChain, defaultValue)
  ) : defaultValue;

/**
 * Checkes if value at the specified path is the same for both of the given objects.
 *
 * @param {Object} obj1
 * @param {Object} obj1
 * @param {Array} propertyChain
 * @returns {boolean}
 */
export const differ = (obj1, obj2, propertyChain) =>
  getIn(obj1, propertyChain) !== getIn(obj2, propertyChain);
