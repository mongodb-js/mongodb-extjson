'use strict';

function toExtendedJSON(obj, options) {
  if (options && options.relaxed) return obj.value;
  return { $numberInt: obj.value.toString() };
}

function fromExtendedJSON(BSON, doc) {
  return new BSON.Int32(doc.$numberInt);
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
