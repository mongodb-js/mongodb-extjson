# MongoDB Extended JSON Library  [![][npm_img]][npm_url] [![][travis_img]][travis_url]


The MongoDB Extended JSON Library allows you to convert MongoDB documents to Extended JSON, and vice versa. See the Extended JSON specification [here](https://github.com/mongodb/specifications/blob/master/source/extended-json.rst).

## Documentation

### Functions

<dl>
<dt><a href="#parse">parse(text, [options])</a> ⇒ <code>object</code></dt>
<dd><p>Parse an Extended JSON string, constructing the JavaScript value or object described by that
string.</p>
</dd>
<dt><a href="#stringify">stringify(value, [replacer], [space], [options])</a> ⇒ <code>string</code></dt>
<dd><p>Converts a BSON document to an Extended JSON string, optionally replacing values if a replacer
function is specified or optionally including only the specified properties if a replacer array
is specified.</p>
</dd>
<dt><a href="#serialize">serialize(bson, [options])</a> ⇒ <code>object</code></dt>
<dd><p>Serializes an object to an Extended JSON string, and reparse it as a JavaScript object.</p>
</dd>
<dt><a href="#deserialize">deserialize(ejson, [options])</a> ⇒ <code>object</code></dt>
<dd><p>Deserializes an Extended JSON object into a plain JavaScript object with native/BSON types</p>
</dd>
</dl>

<a name="parse"></a>

### parse(text, [options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| text | <code>string</code> |  |  |
| [options] | <code>object</code> |  | Optional settings |
| [options.relaxed] | <code>boolean</code> | <code>true</code> | Attempt to return native JS types where possible, rather than BSON types (if true) |

Parse an Extended JSON string, constructing the JavaScript value or object described by that
string.

**Example**  
```js
const EJSON = require('mongodb-extjson');
const text = '{"int32":{"$numberInt":"10"}}';

// prints { int32: { [String: '10'] _bsontype: 'Int32', value: '10' } }
console.log(EJSON.parse(text));

// prints { int32: 10 }
console.log(EJSON.parse(text, {strict: false}));
```
<a name="stringify"></a>

### stringify(value, [replacer], [space], [options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| value | <code>object</code> |  | The value to convert to extended JSON |
| [replacer] | <code>function</code> \| <code>array</code> |  | A function that alters the behavior of the stringification process, or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON string. If this value is null or not provided, all properties of the object are included in the resulting JSON string |
| [space] | <code>string</code> \| <code>number</code> |  | A String or Number object that's used to insert white space into the output JSON string for readability purposes. |
| [options] | <code>object</code> |  | Optional settings |
| [options.relaxed] | <code>boolean</code> | <code>true</code> | Enabled Extended JSON's `relaxed` mode |

Converts a BSON document to an Extended JSON string, optionally replacing values if a replacer
function is specified or optionally including only the specified properties if a replacer array
is specified.

**Example**  
```js
const EJSON = require('mongodb-extjson');
const Int32 = require('mongodb').Int32;
const doc = { int32: new Int32(10) };

// prints '{"int32":{"$numberInt":"10"}}'
console.log(EJSON.stringify(doc));

// prints '{"int32":10}'
console.log(EJSON.stringify(doc, {relaxed: true}));
```
<a name="serialize"></a>

### serialize(bson, [options])

| Param | Type | Description |
| --- | --- | --- |
| bson | <code>object</code> | The object to serialize |
| [options] | <code>object</code> | Optional settings passed to the `stringify` function |

Serializes an object to an Extended JSON string, and reparse it as a JavaScript object.

<a name="deserialize"></a>

### deserialize(ejson, [options])

| Param | Type | Description |
| --- | --- | --- |
| ejson | <code>object</code> | The Extended JSON object to deserialize |
| [options] | <code>object</code> | Optional settings passed to the parse method |

Deserializes an Extended JSON object into a plain JavaScript object with native/BSON types


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

## FAQ

#### What are the various files in dist?

* `mongodb-extjson.bundle.js` is a bundled up version of the library that is suitable for inclusion in an HTML page via a `<script>` tag.
* `mongodb-extjson.esm.js` is a rolled up version of the library that is suitable for interoperation with bundlers that work better with ES modules.
* `mongodb-extjson.browser.esm.js` is similar to `mongodb-extjson.esm.js` but is ultimately intened for consumers producing browser bundles. It also pulls in any browser specific dependencies/code that may be needed.
* `mongodb-extjson.browser.umd.js` is similar to the source code of this library but is ultimately intened for consumers producing browser bundlers expecting a UMD format. It also pulls in any browser specific dependencies/code that may be needed.

