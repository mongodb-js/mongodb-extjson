var assert = require('assert'),
    path = require('path');

function requireUncached(moduleName) {
  var resolved = require.resolve(moduleName);
  var moduleDir = path.dirname(resolved);
  Object.keys(require.cache)
    .filter(function(file) { return file.indexOf(moduleDir) === 0; })
    .forEach(function(key) { delete require.cache[key]; });

  return require(moduleName);
}

var $Buffer = Buffer,
    ExtJSON = null,
    mongodb = null;

// BSON types
var Binary, Code, DBRef, Decimal128, Double,
    Int32, Long, MaxKey, MinKey, ObjectID,
    BSONRegExp, Symbol, Timestamp;

var test = {};
var environments = [
  {
    name: 'node',
    setup: function() {
      ExtJSON = requireUncached('..');
    },
    teardown: function() { },
    beforeEach: function() {
      mongodb = ExtJSON.extend(require('mongodb'));
      Binary = mongodb.Binary;
      Code = mongodb.Code;
      DBRef = mongodb.DBRef;
      Decimal128 = mongodb.Decimal128;
      Double = mongodb.Double;
      Int32 = mongodb.Int32;
      Long = mongodb.Long;
      MaxKey = mongodb.MaxKey;
      MinKey = mongodb.MinKey;
      ObjectID = mongodb.ObjectID;
      BSONRegExp = mongodb.BSONRegExp;
      Symbol = mongodb.Symbol;
      Timestamp = mongodb.Timestamp;

      // Create a new Buffer
      var buffer = new Buffer(64);
      for(var i = 0; i < buffer.length; i++) buffer[i] = i;

      // Fix the date so test have no variable component
      var date = new Date();
      date.setTime(1488372056737);

      test.doc = {
        _id: new Int32(100),
        gh:new Int32(1),
        binary: new Binary(buffer),
        date: date,
        code: new Code('function() {}', {a: new Int32(1)}),
        dbRef: new DBRef('tests', new Int32(1), 'test'),
        decimal: Decimal128.fromString("100"),
        double: new Double(10.10),
        int32: new Int32(10),
        long: Long.fromNumber(200),
        maxKey: new MaxKey(),
        minKey: new MinKey(),
        objectId: ObjectID.createFromHexString('111111111111111111111111'),
        regexp: new BSONRegExp('hello world', 'i'),
        symbol: new Symbol('symbol'),
        timestamp: Timestamp.fromNumber(1000),
        int32Number: 300,
        doubleNumber: 200.20,
        longNumberIntFit: 0x19000000000000,
        doubleNumberIntFit: 19007199250000000.120
      };
    }
  },
  {
    name: 'web',
    setup: function() {
      $Buffer = global.Buffer;
      global.Buffer = undefined;
      ExtJSON = requireUncached('..');
    },
    teardown: function() {
      global.Buffer = $Buffer;
    },
    beforeEach: function() {
      mongodb = require('../lib/bson');
      Binary = mongodb.Binary;
      Code = mongodb.Code;
      DBRef = mongodb.DBRef;
      Decimal128 = mongodb.Decimal128;
      Double = mongodb.Double;
      Int32 = mongodb.Int32;
      Long = mongodb.Long;
      MaxKey = mongodb.MaxKey;
      MinKey = mongodb.MinKey;
      ObjectID = mongodb.ObjectID;
      BSONRegExp = mongodb.BSONRegExp;
      Symbol = mongodb.Symbol;
      Timestamp = mongodb.Timestamp;

      // Create a new Buffer
      var buffer = new Uint8Array(64);
      for(var i = 0; i < buffer.length; i++) buffer[i] = i;

      // Fix the date so test have no variable component
      var date = new Date();
      date.setTime(1488372056737);

      test.doc = {
        _id: new Int32(100),
        gh:new Int32(1),
        binary: new Binary(buffer),
        date: date,
        code: new Code('function() {}', {a: new Int32(1)}),
        dbRef: new DBRef('tests', new Int32(1), 'test'),
        decimal: Decimal128.fromString("100"),
        double: new Double(10.10),
        int32: new Int32(10),
        long: Long.fromNumber(200),
        maxKey: new MaxKey(),
        minKey: new MinKey(),
        objectId: ObjectID.createFromHexString('111111111111111111111111'),
        regexp: new BSONRegExp('hello world', 'i'),
        symbol: new Symbol('symbol'),
        timestamp: Timestamp.fromNumber(1000),
        int32Number: 300,
        doubleNumber: 200.20,
        longNumberIntFit: 0x19000000000000,
        doubleNumberIntFit: 19007199250000000.120
      };
    }
  }
];

describe('Extended JSON', function() {
  environments.forEach(function(env) {
    describe('environment: ' + env.name, function() {
      before(function() { return env.setup(); });
      after(function() { return env.teardown(); });
      beforeEach(function() { return env.beforeEach(); });

      it('should correctly extend an existing mongodb module', function() {
        // Serialize the document
        var json = '{"_id":{"$numberInt":"100"},"gh":{"$numberInt":"1"},"binary":{"$binary":"AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+Pw==","$type":"00"},"date":"2017-03-01T12:40:56.737Z","code":{"$code":"function() {}","$scope":{"a":{"$numberInt":"1"}}},"dbRef":{"$ref":"tests","$id":{"$numberInt":"1"},"$db":"test"},"decimal":{"$numberDecimal":"100"},"double":{"$numberDouble":"10.1"},"int32":{"$numberInt":"10"},"long":{"$numberLong":"200"},"maxKey":{"$maxKey":1},"minKey":{"$minKey":1},"objectId":{"$oid":"111111111111111111111111"},"regexp":{"$regex":"hello world","$options":"i"},"symbol":{"$symbol":"symbol"},"timestamp":{"$timestamp":"1000"},"int32Number":300,"doubleNumber":200.2,"longNumberIntFit":7036874417766400,"doubleNumberIntFit":19007199250000000}';
        assert.equal(json, JSON.stringify(test.doc, null, 0));
      });

      it('should correctly deserialize using strict, and non-strict mode', function() {
        // Create ExtJSON instance
        var extJSON = new ExtJSON();

        // Deserialize the document using non strict mode
        var doc1 = extJSON.parse(extJSON.stringify(test.doc, null, 0), {strict:false});

        // Validate the values
        assert.equal(300, doc1.int32Number);
        assert.equal(200.20, doc1.doubleNumber);
        assert.equal(0x19000000000000, doc1.longNumberIntFit);
        assert.equal(19007199250000000.120, doc1.doubleNumberIntFit);

        // Deserialize the document using strict mode
        var doc1 = extJSON.parse(JSON.stringify(test.doc, null, 0), {strict:true});

        // Validate the values
        assert.equal('Int32', doc1.int32Number._bsontype);
        assert.equal('Double', doc1.doubleNumber._bsontype);
        assert.equal('Double', doc1.longNumberIntFit._bsontype);
        assert.equal('Double', doc1.doubleNumberIntFit._bsontype);
      });

      it('should correctly serialize, and deserialize using built-in BSON', function() {
        // Create ExtJSON instance
        var extJSON = new ExtJSON();
        var Int32 = ExtJSON.BSON.Int32;
        // Create a doc
        var doc1 = {
          int32: new Int32(10)
        };

        // Serialize the document
        var text = extJSON.stringify(doc1, null, 0);
        assert.equal('{"int32":{"$numberInt":"10"}}', text);

        // Deserialize the json in strict and non strict mode
        var doc2 = extJSON.parse(text, {strict: true});
        assert.equal('Int32', doc2.int32._bsontype);
        doc2 = extJSON.parse(text, {strict: false});
        assert.equal(10, doc2.int32);
      });

      it('should correctly serialize bson types when they are values', function() {
        var extJSON = new ExtJSON();
        var Int32 = ExtJSON.BSON.Int32,
            ObjectId = ExtJSON.BSON.ObjectID;

        var serialized = extJSON.stringify(new ObjectID('591801a468f9e7024b6235ea'));
        assert.equal(serialized, '{"$oid":"591801a468f9e7024b6235ea"}');
        serialized = extJSON.stringify(new Int32(42));
        assert.equal(serialized, '{"$numberInt":"42"}');
        serialized =
          extJSON.stringify({ _id: { $nin: [ new ObjectID('591801a468f9e7024b6235ea') ] } });
        assert.equal(serialized, '{"_id":{"$nin":[{"$oid":"591801a468f9e7024b6235ea"}]}}');
      });

      it('should correctly parse null values', function() {
        var extJSON = new ExtJSON();
        var ObjectId = ExtJSON.BSON.ObjectID;

        assert.equal(extJSON.parse('null'), null);
        assert.deepEqual(extJSON.parse('[null]'), [ null ]);
        var input = '{"result":[{"_id":{"$oid":"591801a468f9e7024b623939"},"emptyField":null}]}';
        var parsed = extJSON.parse(input, { strict: false });
        assert.deepEqual(parsed, {
          result: [
            { _id: new ObjectID('591801a468f9e7024b623939'), emptyField: null }
          ]
        });
      });

      it('should correctly throw when passed a non-string to parse', function() {
        // Create ExtJSON instance
        var extJSON = new ExtJSON();
        assert.throws(function() { extJSON.parse({}, {strict: true}); }, Error);
      });
    });
  });
});
