/**
 * A class representation of the BSON Int32 type.
 *
 * @class
 * @param {number} value the number we want to represent as an int32.
 * @return {Int32}
 */
class Int32 {
  constructor(value) {
    this._bsontype = 'Int32';
    this.value = value;
  }

  /**
   * Access the number value.
   *
   * @method
   * @return {number} returns the wrapped int32 number.
   */
  valueOf() {
    return this.value;
  }

  equals(value) {
    if(!value) return false;
    if(typeof value !== 'number' && value._bsontype != 'Int32') return false;
    if(typeof value === 'number') return this.value === value;
    return this.value === value.value;
  }

  toJSON() {
    return { $numberInt: this.value.toString() };
  }
}

module.exports = Int32;
