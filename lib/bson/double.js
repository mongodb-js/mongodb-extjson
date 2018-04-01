'use strict';

function toExtendedJSON(obj, options) {
  if (options && options.relaxed && isFinite(obj.value)) return obj.value;
  return { $numberDouble: obj.value.toString() };
}

function fromExtendedJSON(BSON, doc, options) {
  return options && options.relaxed
    ? parseFloat(doc.$numberDouble)
    : new BSON.Double(parseFloat(doc.$numberDouble));
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
