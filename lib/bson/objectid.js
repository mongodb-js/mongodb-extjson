'use strict';

function toExtendedJSON(obj) {
  if (obj.toHexString) return { $oid: obj.toHexString() };
  return { $oid: obj.toString('hex') };
}

function fromExtendedJSON(BSON, doc) {
  return new BSON.ObjectID(doc.$oid);
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
