'use strict';

function toExtendedJSON(obj, options) {
  if (options && options.relaxed) return obj.value;
  return { $numberInt: obj.value.toString() };
}

function fromExtendedJSON(BSON, doc, options) {
  return options && options.relaxed ? parseInt(doc.$numberInt, 10) : new BSON.Int32(doc.$numberInt);
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
