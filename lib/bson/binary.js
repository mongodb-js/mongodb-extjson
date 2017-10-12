'use strict';

if (typeof Buffer !== 'undefined') {
  var bufferConstructor = new Buffer(1) instanceof Uint8Array ? Buffer : Uint8Array;
} else {
  bufferConstructor = Uint8Array;
}

/**
 * Module dependencies.
 * @ignore
 */
function convert(integer) {
  var str = Number(integer).toString(16);
  return str.length === 1 ? '0' + str : str;
}

function toExtendedJSON(obj) {
  var base64String = typeof Buffer !== 'undefined' ? obj.buffer.toString('base64') : obj.toBase64();

  return {
    $binary: {
      base64: base64String,
      subType: convert(obj.sub_type)
    }
  };
}

function fromExtendedJSON(BSON, doc) {
  var type = doc.$binary.subType ? parseInt(doc.$binary.subType, 16) : 0;

  if (typeof Buffer !== 'undefined' && bufferConstructor === Buffer) {
    var data = new Buffer(doc.$binary.base64, 'base64');
  } else {
    data = new Uint8Array(
      BSON.Binary
        .fromBase64(doc.$binary.base64)
        .split('')
        .map(c => c.charCodeAt(0))
    );
  }

  return new BSON.Binary(data, type);
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
