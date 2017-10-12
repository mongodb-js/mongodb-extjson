'use strict';

function toExtendedJSON(obj, options) {
  if (options.relaxed && isFinite(obj.value)) return obj.value;
  return { $numberDouble: obj.value.toString() };
}

function fromExtendedJSON(BSON, doc) {
  return new BSON.Double(parseFloat(doc.$numberDouble));
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
