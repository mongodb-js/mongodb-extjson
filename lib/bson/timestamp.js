'use strict';

function toExtendedJSON(obj) {
  return {
    $timestamp: {
      t: obj.high_,
      i: obj.low_
    }
  };
}

function fromExtendedJSON(BSON, doc) {
  return new BSON.Timestamp(doc.$timestamp.i, doc.$timestamp.t);
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
