"use strict";

var bsonModule = require('./bson')
var atob = require('./bson/shared').atob;
var bufferConstructor = null;

if (typeof Buffer !== 'undefined') {
  bufferConstructor = new Buffer(1) instanceof Uint8Array
    ? Buffer
    : Uint8Array;
} else {
  bufferConstructor = Uint8Array;
}

var ExtJSON = function(module) {
  if (module) {
    for (var i = 0; i < BSONTypes.length; i++) {
      if (!module[BSONTypes[i]]) throw new Error('passed in module does not contain all BSON types required');
    }

    this.bson = module;
  } else {
    this.bson = bsonModule;
  }
}

ExtJSON.extend = function(module) {
  if (!module) throw new Error("expecting mongodb module, invoke by calling ExtJSON.extend(require('mongodb'))")
  // Rewrite passed in types
  for (var i = 0; i < BSONTypes.length; i++) {
    if (module[BSONTypes[i]]) {
      // Add the toJSON to the passed in types
      // This lets us modify the toJSON method withou breaking
      // backward compatibility
      module[BSONTypes[i]].prototype.toJSON = bsonModule[BSONTypes[i]].prototype.toJSON;
    }
  }

  return module;
}

function deseralizeValue(self, value, options) {
  if (typeof value === 'number') {
    if (options.strict) {
      if (Math.floor(value) === value && value >= JS_INT_MIN && value <= JS_INT_MAX) {
        if (value >= BSON_INT32_MIN && value <= BSON_INT32_MAX) {
          return new self.bson.Int32(value);
        }

        if (value >= JS_INT_MIN && value <= JS_INT_MAX) {
          return new self.bson.Double(value);
        }

        return new self.bson.Long.fromNumber(value);
      }

      return new self.bson.Double(value);
    }


    if (Math.floor(value) === value && value >= JS_INT_MIN && value <= JS_INT_MAX) {
      if (value >= BSON_INT32_MIN && value <= BSON_INT32_MAX) {
        return value;
      }

      if (value >= JS_INT_MIN && value <= JS_INT_MAX) {
        return value;
      }

      return new self.bson.Long.fromNumber(value);
    }
  }

  // from here on out we're looking for bson types, so bail if its
  // not an object
  if (value == null || typeof value !== 'object') {
    return value;
  }

  if (value['$oid'] != null) {
    return new self.bson.ObjectID(value['$oid']);
  };

  if (value['$date'] && typeof value['$date'] === 'string') {
    return Date.parse(value['$date']);
  }

  if (value['$date'] && value['$date'] instanceof self.bson.Long) {
    var date = new Date();
    date.setTime(value['$date'].toNumber());
    return date;
  }

  if (value['$binary'] != null) {
    if (typeof Buffer !== 'undefined') {
      if (bufferConstructor === Buffer) {
        var data = new Buffer(value['$binary'], 'base64');
        var type = value['$type'] ? parseInt(value['$type'], 16) : 0;
        return new self.bson.Binary(data, type);
      }
    }

    var data = new Uint8Array(atob(value['$binary'])
      .split("")
      .map(function(c) {
        return c.charCodeAt(0);
      }));

    var type = value['$type'] ? parseInt(value['$type'], 16) : 0;
    return new self.bson.Binary(data, type);
  }

  if (value['$maxKey'] != null) {
    return new self.bson.MaxKey();
  }

  if (value['$minKey'] != null) {
    return new self.bson.MinKey();
  }

  if (value['$code'] != null) {
    return new self.bson.Code(value['$code'], deseralizeValue(self, value['$scope'] || {}, options));
  }

  if (value['$numberLong'] != null) {
    return self.bson.Long.fromString(value['$numberLong']);
  }

  if (value['$numberDouble'] != null && options.strict) {
    return new self.bson.Double(parseFloat(value['$numberDouble']));
  }

  if (value['$numberDouble'] != null && !options.strict) {
    return parseFloat(value['$numberDouble']);
  }

  if (value['$numberInt'] != null && options.strict) {
    return new self.bson.Int32(parseInt(value['$numberInt'], 10));
  }

  if (value['$numberInt'] != null && !options.strict) {
    return parseInt(value['$numberInt'], 10);
  }

  if (value['$numberDecimal'] != null) {
    return self.bson.Decimal128.fromString(value['$numberDecimal']);
  }

  if (value['$regex'] != null) {
    return new self.bson.BSONRegExp(value['$regex'], value['$options'] || '');
  }

  if (value['$symbol'] != null) {
    return new self.bson.Symbol(value['$symbol']);
  }

  if (value['$ref'] != null) {
    return new self.bson.DBRef(value['$ref'], deseralizeValue(self, value['$id'], options), value['$db']);
  }

  if (value['$timestamp'] != null) {
    return self.bson.Timestamp.fromString(value['$timestamp']);
  }

  return value;
}

ExtJSON.prototype.parse = function(text, options) {
  var self = this;
  options = options || { strict: true };

  try {
    return JSON.parse(text, function(key, value) {
      return deseralizeValue(self, value, options);
    });
  } catch(err) {
    if (err.name === 'SyntaxError') {
      var error = new Error(err.message);
      error.stack = err.stack
      throw error;
    }
  }
}

//
// Serializer
//

// MAX INT32 boundaries
var BSON_INT32_MAX = 0x7FFFFFFF;
var BSON_INT32_MIN = -0x80000000;

// JS MAX PRECISE VALUES
var JS_INT_MAX = 0x20000000000000;  // Any integer up to 2^53 can be precisely represented by a double.
var JS_INT_MIN = -0x20000000000000;  // Any integer down to -2^53 can be precisely represented by a double.

ExtJSON.prototype.stringify = function(value, reducer, indents) {
  var doc = null;

  if(Array.isArray(value)) {
    doc = serializeArray(value);
  } else {
    doc = serializeDocument(value);
  }

  return JSON.stringify(doc, reducer, indents);
}

function serializeArray(array) {
  var _array = new Array(array.length);

  for(var i = 0; i < array.length; i++) {
    _array[i] = serializeValue(array[i]);
  }

  return _array;
}

function serializeValue(value) {
  if(value instanceof Date) {
    return { $date: { $numberLong: value.getTime().toString() } };
  } else if(typeof value == 'number') {
    if(Math.floor(value) === value && value >= JS_INT_MIN && value <= JS_INT_MAX) {
      if(value >= BSON_INT32_MIN && value <= BSON_INT32_MAX) {
        return { $numberInt: value.toString() };
      } else if(value >= JS_INT_MIN && value <= JS_INT_MAX) {
        return { $numberDouble: value.toString() };
      } else {
        return { $numberLong: value.toString() };
      }
    } else {
      return { $numberDouble: value.toString() };
    }
  } else if(Array.isArray(value)) {
    return serializeArray(value);
  } else if(value != null && typeof value == 'object') {
    return serializeDocument(value);
  }

  return value;
}

var BSONTypes = ['Binary', 'Code', 'DBRef', 'Decimal128', 'Double',
  'Int32', 'Long', 'MaxKey', 'MinKey', 'ObjectID', 'BSONRegExp', 'Symbol', 'Timestamp'];

function serializeDocument(doc) {
  if (doc == null || typeof doc !== 'object') {
    throw new Error('not an object instance');
  }

  if (doc != null && doc._bsontype && BSONTypes.indexOf(doc._bsontype) != -1) {
    return doc.toJSON();
  }

  var _doc = {};
  for (var name in doc) {
    if (Array.isArray(doc[name])) {
      _doc[name] = serializeArray(doc[name]);
    } else if (doc[name] != null && doc[name]._bsontype && BSONTypes.indexOf(doc[name]._bsontype) != -1) {
      _doc[name] = doc[name];
    } else if (doc[name] instanceof Date) {
      _doc[name] = serializeValue(doc[name]);
    } else if (doc[name] != null && typeof doc[name] === 'object') {
      _doc[name] = serializeDocument(doc[name]);
    }

    _doc[name] = serializeValue(doc[name]);
  }

  return _doc;
}

// Export the Extended BSON
module.exports = ExtJSON;
