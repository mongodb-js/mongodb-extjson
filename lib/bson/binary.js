'use strict';

/**
 * Module dependencies.
 * @ignore
 */
function convert(integer) {
  var str = Number(integer).toString(16);
  return str.length === 1 ? '0' + str : str;
}

function toExtendedJSON(obj) {
  var base64String = Buffer.isBuffer(obj.buffer)
    ? obj.buffer.toString('base64')
    : Buffer.from(obj.buffer).toString('base64');

  return {
    $binary: {
      base64: base64String,
      subType: convert(obj.sub_type)
    }
  };
}

function fromExtendedJSON(BSON, doc) {
  var type = doc.$binary.subType ? parseInt(doc.$binary.subType, 16) : 0;

  var data = new Buffer(doc.$binary.base64, 'base64');

  return new BSON.Binary(data, type);
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
