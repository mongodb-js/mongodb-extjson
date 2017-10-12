'use strict';

function toExtendedJSON(obj) {
  return { $symbol: obj.value };
}

function fromExtendedJSON(BSON, doc) {
  return new BSON.Symbol(doc.$symbol);
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
