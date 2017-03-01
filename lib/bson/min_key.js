/**
 * A class representation of the BSON MinKey type.
 *
 * @class
 * @return {MinKey} A MinKey instance
 */
class MinKey {
  constructor() {
    this._bsontype = 'MinKey';
  }

  equals(value) {
    if(!value || value._bsontype != 'MinKey') return false;
    return true;
  }

  toJSON() {
    return { $minKey: 1 };
  }
}

module.exports = MinKey;
