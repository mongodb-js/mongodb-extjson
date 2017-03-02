"use strict";

var btoa = require('./shared').btoa;

/**
 * Module dependencies.
 * @ignore
 */
function convert(integer) {
  var str = Number(integer).toString(16);
  return str.length == 1 ? "0" + str : str;
};

/**
 * A class representation of the BSON Binary type.
 *
 * Sub types
 *  - **BSON.BSON_BINARY_SUBTYPE_DEFAULT**, default BSON type.
 *  - **BSON.BSON_BINARY_SUBTYPE_FUNCTION**, BSON function type.
 *  - **BSON.BSON_BINARY_SUBTYPE_BYTE_ARRAY**, BSON byte array type.
 *  - **BSON.BSON_BINARY_SUBTYPE_UUID**, BSON uuid type.
 *  - **BSON.BSON_BINARY_SUBTYPE_MD5**, BSON md5 type.
 *  - **BSON.BSON_BINARY_SUBTYPE_USER_DEFINED**, BSON user defined type.
 *
 * @class
 * @param {Buffer} buffer a buffer object containing the binary data.
 * @param {Number} [subType] the option binary type.
 * @return {Binary}
 */
var Binary = function(buffer, subType) {
  this._bsontype = 'Binary';

  if(buffer instanceof Number) {
    this.sub_type = buffer;
    this.position = 0;
  } else {
    this.sub_type = subType == null ? BSON_BINARY_SUBTYPE_DEFAULT : subType;
    this.position = 0;
  }

  if(buffer != null && !(buffer instanceof Number)) {
    // Only accept Buffer or Uint8Array
    if(typeof buffer == 'string') {
      this.buffer = writeStringToArray(buffer);
    } else if(buffer instanceof Uint8Array) {
      this.buffer = buffer;
    } else {
      throw new Error('passed in buffer must be an Uint8Array instance');
    }

    this.position = buffer.length;
  } else {
    this.buffer = new Uint8Array(new ArrayBuffer(Binary.BUFFER_SIZE));
    // Set position to start of buffer
    this.position = 0;
  }
}

/**
 * Updates this binary with byte_value.
 *
 * @method
 * @param {String} byte_value a single byte we wish to write.
 */
Binary.prototype.put = function(byte_value) {
  // If it's a string and a has more than one character throw an error
  if(byte_value['length'] != null && typeof byte_value != 'number' && byte_value.length != 1) throw new Error("only accepts single character String, Uint8Array or Array");
  if(typeof byte_value != 'number' && byte_value < 0 || byte_value > 255) throw new Error("only accepts number in a valid unsigned byte range 0-255");

  // Decode the byte value once
  var decoded_byte = null;
  if(typeof byte_value == 'string') {
    decoded_byte = byte_value.charCodeAt(0);
  } else if(byte_value['length'] != null) {
    decoded_byte = byte_value[0];
  } else {
    decoded_byte = byte_value;
  }

  if(this.buffer.length > this.position) {
    this.buffer[this.position++] = decoded_byte;
  } else {
    var buffer = null;
    // Create a new buffer (typed or normal array)
    buffer = new Uint8Array(new ArrayBuffer(Binary.BUFFER_SIZE + this.buffer.length));

    // We need to copy all the content to the new array
    for(var i = 0; i < this.buffer.length; i++) {
      buffer[i] = this.buffer[i];
    }

    // Reassign the buffer
    this.buffer = buffer;
    // Write the byte
    this.buffer[this.position++] = decoded_byte;
  }
}

/**
 * Writes a buffer or string to the binary.
 *
 * @method
 * @param {(Buffer|string)} string a string or buffer to be written to the Binary BSON object.
 * @param {number} offset specify the binary of where to write the content.
 * @return {null}
 */
Binary.prototype.write = function(string, offset) {
  offset = typeof offset == 'number' ? offset : this.position;

  // If the buffer is to small let's extend the buffer
  if(this.buffer.length < offset + string.length) {
    var buffer = null;
    // Create a new buffer
    buffer = new Uint8Array(new ArrayBuffer(this.buffer.length + string.length))
    // Copy the content
    for(var i = 0; i < this.position; i++) {
      buffer[i] = this.buffer[i];
    }

    // Assign the new buffer
    this.buffer = buffer;
  }

  for(var i = 0; i < string.length; i++) {
    this.buffer[offset++] = string[i];
  }

  this.position = offset > this.position ? offset : this.position;
}

/**
 * Reads **length** bytes starting at **position**.
 *
 * @method
 * @param {number} position read from the given position in the Binary.
 * @param {number} length the number of bytes to read.
 * @return {Buffer}
 */
Binary.prototype.read = function(position, length) {
  length = length && length > 0
    ? length
    : this.position;

  // Let's return the data based on the type we have
  return this.buffer.slice(position, position + length);
}

/**
 * Returns the value of this binary as a string.
 *
 * @method
 * @return {String}
 */
Binary.prototype.value = function(asRaw) {
  asRaw = asRaw == null ? false : asRaw;
  if(asRaw) return this.buffer.slice(0, this.position);
  return convertArraytoUtf8BinaryString(this.buffer, 0, this.position);
}

/**
 * Length.
 *
 * @method
 * @return {number} the length of the binary.
 */
Binary.prototype.length = function() {
  return this.position;
}

Binary.prototype.equals = function(value) {
  if(!value) return false;
  if(value._bsontype != 'Binary') return false;
  if(!value.buffer) return false;
  if(value.buffer.length != this.buffer.length) return false;
  for(var i = 0; i < this.buffer.length; i++) {
    if(this.buffer[i] != value.buffer[i]) return false;
  }

  return true;
}

/**
 * @ignore
 */
Binary.prototype.toJSON = function() {
  // If we are in the node.js context use Buffer.toString, otherwise the btoa
  var binary = typeof Buffer !== 'undefined'
    ? this.buffer.toString('base64')
    : btoa(String.fromCharCode.apply(null, this.buffer));

  return {
    $binary: binary,
    $type: convert(this.sub_type)
  }
}

/**
 * @ignore
 */
Binary.prototype.toString = function(format) {
  return this.buffer != null ? this.buffer.slice(0, this.position).toString(format) : '';
}

/**
 * Binary default subtype
 * @ignore
 */
var BSON_BINARY_SUBTYPE_DEFAULT = 0;

/**
 * @ignore
 */
var writeStringToArray = function(data) {
  // Create a buffer
  var buffer = new Uint8Array(new ArrayBuffer(data.length));
  // Write the content to the buffer
  for(var i = 0; i < data.length; i++) {
    buffer[i] = data.charCodeAt(i);
  }
  // Write the string to the buffer
  return buffer;
}

/**
 * Convert Array ot Uint8Array to Binary String
 *
 * @ignore
 */
var convertArraytoUtf8BinaryString = function(byteArray, startIndex, endIndex) {
  var result = "";
  for(var i = startIndex; i < endIndex; i++) {
   result = result + String.fromCharCode(byteArray[i]);
  }
  return result;
};

Binary.BUFFER_SIZE = 256;

/**
 * Default BSON type
 *
 * @classconstant SUBTYPE_DEFAULT
 **/
Binary.SUBTYPE_DEFAULT = 0;
/**
 * Function BSON type
 *
 * @classconstant SUBTYPE_DEFAULT
 **/
Binary.SUBTYPE_FUNCTION = 1;
/**
 * Byte Array BSON type
 *
 * @classconstant SUBTYPE_DEFAULT
 **/
Binary.SUBTYPE_BYTE_ARRAY = 2;
/**
 * OLD UUID BSON type
 *
 * @classconstant SUBTYPE_DEFAULT
 **/
Binary.SUBTYPE_UUID_OLD = 3;
/**
 * UUID BSON type
 *
 * @classconstant SUBTYPE_DEFAULT
 **/
Binary.SUBTYPE_UUID = 4;
/**
 * MD5 BSON type
 *
 * @classconstant SUBTYPE_DEFAULT
 **/
Binary.SUBTYPE_MD5 = 5;
/**
 * User BSON type
 *
 * @classconstant SUBTYPE_DEFAULT
 **/
Binary.SUBTYPE_USER_DEFINED = 128;

module.exports = Binary;
