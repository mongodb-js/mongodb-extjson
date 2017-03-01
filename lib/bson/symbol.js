/**
 * A class representation of the BSON Symbol type.
 *
 * @class
 * @deprecated
 * @param {String} value the string representing the symbol.
 * @return {Symbol}
 */
class Symbol {
  constructor(value) {
    this._bsontype = 'Symbol';
    this.value = value;
  }

  /**
   * Access the wrapped string value.
   *
   * @method
   * @return {String} returns the wrapped string.
   */
  valueOf() {
    return this.value;
  };

  equals(value) {
    if(!value || !value.value) return false;
    if(value._bsontype != 'Symbol') return false;
    return this.value === value.value;
  }

  /**
   * @ignore
   */
  toJSON() {
    return { $symbol: this.value };
  }
}

module.exports = Symbol;
