"use strict";

/**
 * A class representation of the BSON MinKey type.
 *
 * @class
 * @return {MinKey} A MinKey instance
 */
var MinKey = function() {
  this._bsontype = 'MinKey';
}

MinKey.prototype.equals = function(value) {
  if(!value || value._bsontype != 'MinKey') return false;
  return true;
}

MinKey.prototype.toJSON = function() {
  return { $minKey: 1 };
}

module.exports = MinKey;
