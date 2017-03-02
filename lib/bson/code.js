"use strict";

/**
 * A class representation of the BSON Code type.
 *
 * @class
 * @param {(string|function)} code a string or function.
 * @param {Object} [scope] an optional scope for the function.
 * @return {Code}
 */
var Code = function(code, scope) {
  this._bsontype = 'Code';
  this.code = code;
  this.scope = scope;
}

Code.prototype.equals = function(value) {
  if(!value || !value.code) return false;
  if(value._bsontype != 'Code') return false;
  if(this.code == value.code) return true;
  return false;
}

Code.prototype.toJSON = function() {
  return { $code: this.code, $scope: this.scope };
}

module.exports = Code;
