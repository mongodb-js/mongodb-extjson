'use strict';

function toExtendedJSON(obj, options) {
  if (options && options.relaxed) return obj.toNumber();
  return { $numberLong: obj.toString() };
}

function fromExtendedJSON(BSON, doc, options) {
  const result = BSON.Long.fromString(doc.$numberLong);
  return options && options.relaxed ? result.toNumber() : result;
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
