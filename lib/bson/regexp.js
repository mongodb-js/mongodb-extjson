'use strict';

function toExtendedJSON(obj) {
  return { $regularExpression: { pattern: obj.pattern, options: obj.options } };
}

function fromExtendedJSON(BSON, doc) {
  return new BSON.BSONRegExp(
    doc.$regularExpression.pattern,
    doc.$regularExpression.options
      .split('')
      .sort()
      .join('')
  );
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
