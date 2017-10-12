'use strict';

function toExtendedJSON(obj) {
  return { $numberDecimal: obj.toString() };
}

function fromExtendedJSON(BSON, doc) {
  return new BSON.Decimal128.fromString(doc.$numberDecimal);
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
