/**
 * A class representation of the BSON MaxKey type.
 *
 * @class
 * @return {MaxKey} A MaxKey instance
 */
class MaxKey {
  constructor() {
    this._bsontype = 'MaxKey';
  }

  equals(value) {
    if(!value || value._bsontype != 'MaxKey') return false;
    return true;
  }

  toJSON() {
    return { $maxKey: 1 };
  }
}

module.exports = MaxKey;
