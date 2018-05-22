'use strict';

let codecs = require('./bson'),
  BSON = require('bson');

var BSONTypes = [
  'Binary',
  'Code',
  'DBRef',
  'Decimal128',
  'Double',
  'Int32',
  'Long',
  'MaxKey',
  'MinKey',
  'ObjectID',
  'BSONRegExp',
  'Symbol',
  'Timestamp'
];

setBSONModule(BSON);

// all the types where we don't need to do any special processing and can just pass the EJSON
//straight to type.fromExtendedJSON
var keysToCodecs = {
  $oid: codecs.ObjectID,
  $binary: codecs.Binary,
  $symbol: codecs.Symbol,
  $numberInt: codecs.Int32,
  $numberDecimal: codecs.Decimal128,
  $numberDouble: codecs.Double,
  $numberLong: codecs.Long,
  $minKey: codecs.MinKey,
  $maxKey: codecs.MaxKey,
  $regularExpression: codecs.BSONRegExp,
  $timestamp: codecs.Timestamp
};

function setBSONModule(module) {
  BSONTypes.forEach(t => {
    if (!module[t]) throw new Error('passed in module does not contain all BSON types required');
  });
  BSON = module;
}

function deserializeValue(self, key, value, options) {
  if (typeof value === 'number') {
    // if it's an integer, should interpret as smallest BSON integer
    // that can represent it exactly. (if out of range, interpret as double.)
    if (Math.floor(value) === value) {
      let int32Range = value >= BSON_INT32_MIN && value <= BSON_INT32_MAX,
        int64Range = value >= BSON_INT64_MIN && value <= BSON_INT64_MAX;

      if (int32Range) return options.strict ? new BSON.Int32(value) : value;
      if (int64Range) return options.strict ? new BSON.Long.fromNumber(value) : value;
    }
    // If the number is a non-integer or out of integer range, should interpret as BSON Double.
    return new BSON.Double(value);
  }

  // from here on out we're looking for bson types, so bail if its not an object
  if (value == null || typeof value !== 'object') return value;

  // upgrade deprecated undefined to null
  if (value.$undefined) return null;

  var keys = Object.keys(value).filter(k => k.startsWith('$') && value[k] != null);
  for (let i = 0; i < keys.length; i++) {
    let c = keysToCodecs[keys[i]];
    if (c) return c.fromExtendedJSON(BSON, value, options);
  }

  if (value.$date != null) {
    let d = value.$date,
      date = new Date();

    if (typeof d === 'string') date.setTime(Date.parse(d));
    else if (d instanceof BSON.Long) date.setTime(d.toNumber());
    else if (typeof d === 'number' && options.relaxed) date.setTime(d);
    return date;
  }

  if (value.$code != null) {
    if (value.$scope) var scope = deserializeValue(self, null, value.$scope);
    let copy = Object.assign({}, value);
    copy.$scope = scope;
    return codecs.Code.fromExtendedJSON(BSON, value);
  }

  if (value.$ref != null || value.$dbPointer != null) {
    let v = value.$ref ? value : value.$dbPointer;

    // we run into this in a "degenerate EJSON" case (with $id and $ref order flipped)
    // because of the order JSON.parse goes through the document
    if (v instanceof BSON.DBRef) return v;

    let dollarKeys = Object.keys(v).filter(k => k.startsWith('$')),
      valid = true;
    dollarKeys.forEach(k => {
      if (['$ref', '$id', '$db'].indexOf(k) === -1) valid = false;
    });

    // only make DBRef if $ keys are all valid
    if (valid) return codecs.DBRef.fromExtendedJSON(BSON, v);
  }

  return value;
}

const parse = function(text, options) {
  var self = this;
  options = options || { relaxed: false };

  // relaxed implies not strict
  if (typeof options.relaxed === 'boolean') options.strict = !options.relaxed;
  if (typeof options.strict === 'boolean') options.relaxed = !options.strict;

  return JSON.parse(text, function(key, value) {
    return deserializeValue(self, key, value, options);
  });
};

//
// Serializer
//

// MAX INT32 boundaries
const BSON_INT32_MAX = 0x7fffffff,
  BSON_INT32_MIN = -0x80000000,
  BSON_INT64_MAX = 0x7fffffffffffffff,
  BSON_INT64_MIN = -0x8000000000000000;

const stringify = function(value, reducer, indents, options) {
  var opts = {};
  if (options != null && typeof options === 'object') opts = options;
  else if (indents != null && typeof indents === 'object') {
    opts = indents;
    indents = 0;
  } else if (reducer != null && typeof reducer === 'object') {
    opts = reducer;
    reducer = null;
  }

  var doc = Array.isArray(value) ? serializeArray(value, opts) : serializeDocument(value, opts);
  return JSON.stringify(doc, reducer, indents);
};

function serializeArray(array, options) {
  return array.map(v => serializeValue(v, options));
}

function getISOString(date) {
  var isoStr = date.toISOString();
  // we should only show milliseconds in timestamp if they're non-zero
  return date.getUTCMilliseconds() !== 0 ? isoStr : isoStr.slice(0, -5) + 'Z';
}

function serializeValue(value, options) {
  if (Array.isArray(value)) return serializeArray(value, options);

  if (value === undefined) return null;

  if (value instanceof Date) {
    let dateNum = value.getTime(),
      // is it in year range 1970-9999?
      inRange = dateNum > -1 && dateNum < 253402318800000;

    return options.relaxed && inRange
      ? { $date: getISOString(value) }
      : { $date: { $numberLong: value.getTime().toString() } };
  }

  if (typeof value === 'number' && !options.relaxed) {
    // it's an integer
    if (Math.floor(value) === value) {
      let int32Range = value >= BSON_INT32_MIN && value <= BSON_INT32_MAX,
        int64Range = value >= BSON_INT64_MIN && value <= BSON_INT64_MAX;

      // interpret as being of the smallest BSON integer type that can represent the number exactly
      if (int32Range) return { $numberInt: value.toString() };
      if (int64Range) return { $numberLong: value.toString() };
    }
    return { $numberDouble: value.toString() };
  }

  if (value != null && typeof value === 'object') return serializeDocument(value, options);
  return value;
}

function serializeDocument(doc, options) {
  if (doc == null || typeof doc !== 'object') throw new Error('not an object instance');

  // the document itself is a BSON type
  if (doc._bsontype && BSONTypes.indexOf(doc._bsontype) !== -1) {
    // we need to separately serialize the embedded scope document
    if (doc._bsontype === 'Code' && doc.scope) {
      let tempScope = serializeDocument(doc.scope, options),
        tempDoc = Object.assign({}, doc, { scope: tempScope });
      return codecs['Code'].toExtendedJSON(tempDoc, options);
      // we need to separately serialize the embedded OID document
    } else if (doc._bsontype === 'DBRef' && doc.oid) {
      let tempId = serializeDocument(doc.oid, options),
        tempDoc = Object.assign({}, doc, { oid: tempId });
      return codecs['DBRef'].toExtendedJSON(tempDoc, options);
    }
    return codecs[doc._bsontype].toExtendedJSON(doc, options);
  }

  // the document is an object with nested BSON types
  var _doc = {};
  for (var name in doc) {
    let val = doc[name];
    if (Array.isArray(val)) {
      _doc[name] = serializeArray(val, options);
    } else if (val != null && val._bsontype && BSONTypes.indexOf(val._bsontype) !== -1) {
      // we need to separately serialize the embedded scope document
      if (val._bsontype === 'Code' && val.scope) {
        let tempScope = serializeDocument(val.scope, options),
          tempVal = Object.assign({}, val, { scope: tempScope });
        _doc[name] = codecs['Code'].toExtendedJSON(tempVal, options);
        // we need to separately serialize the embedded OID document
      } else if (val._bsontype === 'DBRef' && val.oid) {
        let tempId = serializeDocument(val.oid, options),
          tempVal = Object.assign({}, val, { oid: tempId });
        _doc[name] = codecs['DBRef'].toExtendedJSON(tempVal, options);
      } else _doc[name] = codecs[val._bsontype].toExtendedJSON(val, options);
    } else if (val instanceof Date) {
      _doc[name] = serializeValue(val, options);
    } else if (val != null && typeof val === 'object') {
      _doc[name] = serializeDocument(val, options);
    }
    _doc[name] = serializeValue(val, options);
    if (val instanceof RegExp) {
      let flags = val.flags;
      if (flags === undefined) {
        flags = val.toString().match(/[gimuy]*$/)[0];
      }
      _doc[name] = codecs['BSONRegExp'].toExtendedJSON({ pattern: val.source, options: flags });
    }
  }

  return _doc;
}

module.exports = {
  parse: parse,
  stringify: stringify,
  setBSONModule: setBSONModule,
  BSON: BSON
};
