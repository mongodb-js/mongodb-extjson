# MongoDB Extended JSON Library  [![][npm_img]][npm_url] [![][travis_img]][travis_url]


The MongoDB Extended JSON Library allows you to convert MongoDB documents to Extended JSON, and vice versa. See the Extended JSON specification [here](https://github.com/mongodb/specifications/blob/master/source/extended-json.rst).

## Usage with MongoDB Driver
This library can be used along with the [MongoDB driver for Node.js](https://github.com/mongodb/node-mongodb-native) to convert MongoDB documents to extended JSON form.

### Serialize a document
Serialize a document using `EJSON.stringify(value, reducer, indents, options)`. The `reducer` and `indents` arguments are analogous to `JSON.stringify`'s `replacer` and `spaces` arguments, respectively (see [documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).) 

`options` currently supports a single option, `relaxed`; with `options = {relaxed: true}`, the returned object will be in the more readable "relaxed" extended JSON format. 

```js
let EJSON = require('mongodb-extjson'),
	Int32 = require('mongodb').Int32;
    
var doc = { int32: new Int32(10) };

// prints '{"int32":{"$numberInt":"10"}}'
console.log(EJSON.stringify(doc));

// prints '{"int32":10}'
console.log(EJSON.stringify(doc, {relaxed: true}));
```

## Usage with MongoDB BSON Library
Our [js-bson](https://github.com/mongodb/js-bson) library is included as a dependency and used by default for Javascript representations of BSON types. See the next section for instructions on using it with a different BSON library. 

### Serialize a document
This works identically to the previous serialize example, but does not require including the MongoDB driver. The BSON types are all available under EJSON.BSON.

```js
let EJSON = require('mongodb-extjson'),
	Int32 = EJSON.BSON.Int32;
    
var doc = { int32: new Int32(10) };

// prints '{"int32":{"$numberInt":"10"}}'
console.log(EJSON.stringify(doc));
```

### Deserialize a document
The library also allows converting extended JSON strings to Javascript objects, using BSON type classes defined in js-bson. You can do this using `EJSON.parse(string, options)`. 

This method supports the option `strict`. By default, `strict` is true; if `strict` is set to `false`, the parser will attempt to return native JS types where possible, rather than BSON types (i.e. return a `Number` instead of a `BSON.Int32` object, etc.) 

```js
let EJSON = require('mongodb-extjson');

var text = '{"int32":{"$numberInt":"10"}}';

// prints { int32: { [String: '10'] _bsontype: 'Int32', value: '10' } }
console.log(EJSON.parse(text));

// prints { int32: 10 }
console.log(EJSON.parse(text, {strict: false}));
```


## Usage With Other BSON Parsers

Although we include the pure Javascript BSON parser by default, you can also use a different BSON parser with this library, such as [bson-ext](https://www.npmjs.com/package/bson-ext). For example:

```js
let EJSON = require('mongodb-extjson'),
	BSON = require('bson-ext'),
    Int32 = BSON.Int32;

// set BSON module to be bson-ext 
EJSON.setBSONModule(BSON);

var doc = { int32: new Int32(10) };
// prints '{"int32":{"$numberInt":"10"}}'
console.log(EJSON.stringify(doc));

var text = '{"int32":{"$numberInt":"10"}}';
// prints { int32: { [String: '10'] _bsontype: 'Int32', value: '10' } }
console.log(EJSON.parse(text));
```

[travis_img]: https://api.travis-ci.org/mongodb-js/mongodb-extjson.svg?branch=master
[travis_url]: https://travis-ci.org/mongodb-js/mongodb-extjson
[npm_img]: https://img.shields.io/npm/v/mongodb-extjson.svg
[npm_url]: https://www.npmjs.org/package/mongodb-extjson
