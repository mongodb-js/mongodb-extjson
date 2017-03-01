// var {
//   Int32, Long, MaxKey, MinKey, ObjectID, BSONRegExp, Symbol, Timestamp
// } = require('../bson');

var bsonModule = require('./bson')
var Binary = bsonModule.Binary,
  Code = bsonModule.Code,
  DBRef = bsonModule.DBRef,
  Decimal128 = bsonModule.Decimal128,
  Double = bsonModule.Double,
  Int32 = bsonModule.Int32,
  Long = bsonModule.Long,
  MaxKey = bsonModule.MaxKey,
  MinKey = bsonModule.MinKey,
  ObjectID = bsonModule.ObjectID,
  BSONRegExp = bsonModule.BSONRegExp,
  Symbol = bsonModule.Symbol,
  Timestamp = bsonModule.Timestamp;

function deseralizeValue(value, options) {
  if(value['$oid'] != null) {
    return new ObjectID(value['$oid']);
  } else if(value['$date'] && typeof value['$date'] == 'string') {
    return Date.parse(value['$date']);
  } else if(value['$date'] && value['$date'] instanceof Long) {
    var date = new Date();
    date.setTime(value['$date'].toNumber());
    return date;
  } else if(value['$binary'] != null) {
    const data = new Uint8Array(atob(value['$binary'])
      .split("")
      .map(function(c) {
        return c.charCodeAt(0);
      }));
    const type = value['$type'] ? parseInt(value['$type'], 16) : 0;
    return new Binary(data, type);
  } else if(value['$maxKey'] != null) {
    return new MaxKey();
  } else if(value['$minKey'] != null) {
    return new MinKey();
  } else if(value['$code'] != null) {
    return new Code(value['$code'], deseralizeValue(value['$scope'] || {}, options))
  } else if(value['$numberLong'] != null) {
    return Long.fromString(value['$numberLong']);
  } else if(value['$numberDouble'] != null && options.strict) {
    return new Double(parseFloat(value['$numberDouble']));
  } else if(value['$numberDouble'] != null && !options.strict) {
    return parseFloat(value['$numberDouble']);
  } else if(value['$numberInt'] != null && options.strict) {
    return new Int32(parseInt(value['$numberInt'], 10));
  } else if(value['$numberInt'] != null && !options.strict) {
    return parseInt(value['$numberInt'], 10);
  } else if(value['$numberDecimal'] != null) {
    return Decimal128.fromString(value['$numberDecimal']);
  } else if(value['$regex'] != null) {
    return new BSONRegExp(value['$regex'], value['$options'] || '');
  } else if(value['$symbol'] != null) {
    return new Symbol(value['$symbol']);
  } else if(value['$ref'] != null) {
    return new DBRef(value['$ref'], deseralizeValue(value['$id'], options), value['$db']);
  } else if(value['$timestamp'] != null) {
    return Timestamp.fromString(value['$timestamp']);
  } else if(typeof value == 'number' && options.strict) {
    if(Math.floor(value) === value && value >= JS_INT_MIN && value <= JS_INT_MAX) {
      if(value >= BSON_INT32_MIN && value <= BSON_INT32_MAX) {
        return new Int32(value);
      } else if(value >= JS_INT_MIN && value <= JS_INT_MAX) {
        return new Double(value);
      } else {
        return new Long.fromNumber(value);
      }
    } else {
      return new Double(value);
    }
  } else if(typeof value == 'number' && !options.strict) {
    if(Math.floor(value) === value && value >= JS_INT_MIN && value <= JS_INT_MAX) {
      if(value >= BSON_INT32_MIN && value <= BSON_INT32_MAX) {
        return value;
      } else if(value >= JS_INT_MIN && value <= JS_INT_MAX) {
        return value;
      } else {
        return new Long.fromNumber(value);
      }
    } else {
      return value;
    }
  } else {
    return value;
  }
}

function deserialize(text, options) {
  options = options || { strict: true };

  var object = JSON.parse(text, function(key, value) {
    return deseralizeValue(value, options);
  });

  return object;
}

//
// Serializer
//

// MAX INT32 boundaries
const BSON_INT32_MAX = 0x7FFFFFFF;
const BSON_INT32_MIN = -0x80000000;

// JS MAX PRECISE VALUES
const JS_INT_MAX = 0x20000000000000;  // Any integer up to 2^53 can be precisely represented by a double.
const JS_INT_MIN = -0x20000000000000;  // Any integer down to -2^53 can be precisely represented by a double.

function serialize(value, reducer, indents) {
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

const BSONTypes = ['Binary', 'Code', 'DBRef', 'Decimal128', 'Double',
  'Int32', 'Long', 'MaxKey', 'MinKey', 'ObjectID', 'BSONRegExp', 'Symbol', 'Timestamp'];

function serializeDocument(doc) {
  if(doc == null || typeof doc !== 'object') throw new Error('not an object instance');
  var _doc = {};

  for(var name in doc) {
    if(Array.isArray(doc[name])) {
      _doc[name] = serializeArray(doc[name]);
    } else if(doc[name] != null && doc[name]._bsontype && BSONTypes.indexOf(doc[name]._bsontype) != -1) {
      _doc[name] = doc[name];
    } else if(doc[name] instanceof Date) {
      _doc[name] = serializeValue(doc[name]);
    } else if(doc[name] != null && typeof doc[name] === 'object') {
      _doc[name] = serializeDocument(doc[name]);
    } else {
      _doc[name] = serializeValue(doc[name]);
    }
  }

  return _doc;
}

var ExtJSON = function(module) {
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

// Add the prototype objects
ExtJSON.prototype.deserialize = deserialize;
ExtJSON.prototype.deseralizeValue = deseralizeValue;
ExtJSON.prototype.serialize = serialize;

// Export the Extended BSON
module.exports = ExtJSON;
