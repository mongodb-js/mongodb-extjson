'use strict';

function toExtendedJSON(obj, options) {
  if (options && options.relaxed) return obj.toNumber();
  return { $numberLong: obj.toString() };
}

function fromExtendedJSON(BSON, doc) {
  return BSON.Long.fromString(doc.$numberLong);
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
