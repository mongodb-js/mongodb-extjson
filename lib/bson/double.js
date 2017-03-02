"use strict";

/**
 * A class representation of the BSON Double type.
 *
 * @class
 * @param {number} value the number we want to represent as a double.
 * @return {Double}
 */
var Double = function(value) {
  this._bsontype = 'Double';
  this.value = value;
}

/**
 * Access the number value.
 *
 * @method
 * @return {number} returns the wrapped double number.
 */
Double.prototype.valueOf = function() {
  return this.value;
}

Double.prototype.equals = function(value) {
  if(!value) return false;
  if(typeof value !== 'number' && value._bsontype != 'Double') return false;
  if(typeof value === 'number') return this.value === value;
  return this.value === value.value;
}

Double.prototype.toJSON = function() {
  return { $numberDouble: this.value.toString() };
}

module.exports = Double;
