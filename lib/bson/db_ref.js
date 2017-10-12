'use strict';

function toExtendedJSON(obj) {
  var o = {
    $ref: obj.collection,
    $id: obj.oid
  };
  if (obj.db) o.$db = obj.db;
  o = Object.assign(o, obj.fields);
  return o;
}

function fromExtendedJSON(BSON, doc) {
  var copy = Object.assign({}, doc);
  ['$ref', '$id', '$db'].forEach(k => delete copy[k]);
  return new BSON.DBRef(doc.$ref, doc.$id, doc.$db, copy);
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
