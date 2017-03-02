"use strict";

/**
 * A class representation of the BSON RegExp type.
 *
 * @class
 * @return {BSONRegExp} A MinKey instance
 */
var BSONRegExp = function(pattern, options) {
  // Execute
  this._bsontype = 'BSONRegExp';
  this.pattern = pattern;
  this.options = options || '';
  // Perform validation of parameters
  if(typeof this.pattern != 'string') throw Error('pattern must be a string');
  if(typeof this.options != 'string') throw Error('options must be a string');

  // Validate options
  for(var i = 0; i < options.length; i++) {
    if(!(this.options[i] == 'i'
      || this.options[i] == 'm'
      || this.options[i] == 'x'
      || this.options[i] == 'l'
      || this.options[i] == 's'
      || this.options[i] == 'u'
    )) {
      throw new Error('the regular expression options [' + this.options[i] + "] is not supported");
    }
  }
}

BSONRegExp.prototype.equals = function(value) {
  if(!value || value._bsontype != 'BSONRegExp') return false;
  return this.pattern == value.pattern && this.options == value.options;
}

BSONRegExp.prototype.toJSON = function() {
  return { $regex: this.pattern, $options: this.options };
}

module.exports = BSONRegExp;
