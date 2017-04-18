[![Build Status](https://travis-ci.org/christkv/mongodb-extjson.svg?branch=master)](https://travis-ci.org/christkv/mongodb-extjson)

# MongoDB Extended JSON Library

The MongoDB Extended JSON Library allows you to turn a MongoDB Document into Extended JSON.

https://github.com/mongodb/specifications/blob/master/source/extended-json.rst

## Usage with MongoDB driver
To use this library with the driver there are a couple of way.

### Override the toJSON of driver BSON types
This lets you override the toJSON functions on the MongoDB driver to ensure `JSON.stringify` returns an Extended JSON document. Let's look at an example.

```js
var ExtJSON = require('mongodb-extjson');
var mongodb = ExtJSON.extend(require('mongodb'));
var Int32 = mongodb.Int32;

var doc = {
  int32: new Int32(10),
}

console.log(JSON.stringify(doc, null, 2));
```

### Use library directly
Let's look at how we can serialize a document.

### Serialize a document
Serialize a document using `ExtJSON.prototype.stringify`.

```js
var ExtJSON = require('mongodb-extjson');
var mongodb = require('mongodb');
var Int32 = mongodb.Int32;
var extJSON = new ExtJSON(mongodb);

var doc = {
  int32: new Int32(10),
}

console.log(extJSON.stringify(doc, null, 2));
```

### Deserialize a document
Serialize a document using `ExtJSON.prototype.parse(string, options)`. The method supports the option `strict`.

```
strict = true, will return BSON type objects for all values.
strict = false, will attempt to return native JS types where possible.
```

```js
var ExtJSON = require('mongodb-extjson');
var mongodb = require('mongodb');
var Int32 = mongodb.Int32;
var extJSON = new ExtJSON(mongodb);

var doc = {
  int32: new Int32(10),
}

// Serialize the document
var text = extJSON.stringify(doc, null, 2);
// Deserialize using strict mode (returning BSON type objects)
console.dir(extJSON.parse(text, {strict: true}));
// Deserialize using strict mode (converting to native JS types where possible)
console.dir(extJSON.parse(text, {strict: true}));
```

## Usage with Builtin BSON types
This allows you to use this library with full types in a Browser

### Serialize a document
Serialize a document using `ExtJSON.prototype.stringify`.

```js
var ExtJSON = require('mongodb-extjson');
var Int32 = ExtJSON.BSON.Int32;
var extJSON = new ExtJSON();

var doc = {
  int32: new Int32(10),
}

console.log(extJSON.stringify(doc, null, 2));
```

### Deserialize a document
Serialize a document using `ExtJSON.prototype.parse(string, options)`. The method supports the option `strict`.

```
strict = true, will return BSON type objects for all values.
strict = false, will attempt to return native JS types where possible.
```

```js
var ExtJSON = require('mongodb-extjson');
var Int32 = ExtJSON.BSON.Int32;
var extJSON = new ExtJSON();

var doc = {
  int32: new Int32(10),
}

// Serialize the document
var text = extJSON.stringify(doc, null, 2);
// Deserialize using strict mode (returning BSON type objects)
console.dir(extJSON.parse(text, {strict: true}));
// Deserialize using strict mode (converting to native JS types where possible)
console.dir(extJSON.parse(text, {strict: true}));
```
