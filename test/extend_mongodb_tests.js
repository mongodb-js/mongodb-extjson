'use strict';

let assert = require('assert'),
  path = require('path'),
  expect = require('chai').expect;

function requireUncached(moduleName) {
  var resolved = require.resolve(moduleName);
  var moduleDir = path.dirname(resolved);
  Object.keys(require.cache)
    .filter(function(file) {
      return file.indexOf(moduleDir) === 0;
    })
    .forEach(function(key) {
      delete require.cache[key];
    });

  return require(moduleName);
}

var extJSON = null,
  mongodb = null;

// BSON types
var Binary,
  Code,
  DBRef,
  Decimal128,
  Double,
  Int32,
  Long,
  MaxKey,
  MinKey,
  ObjectID,
  BSONRegExp,
  Symbol,
  Timestamp;

var test = {};
var environments = [
  {
    name: 'node',
    setup: function() {
      extJSON = requireUncached('..');
    },
    teardown: function() {},
    beforeEach: function() {
      mongodb = require('mongodb');
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
      for (var i = 0; i < buffer.length; i++) buffer[i] = i;

      // Fix the date so test have no variable component
      var date = new Date();
      date.setTime(1488372056737);

      test.doc = {
        _id: new Int32(100),
        gh: new Int32(1),
        binary: new Binary(buffer),
        date: date,
        code: new Code('function() {}', { a: new Int32(1) }),
        dbRef: new DBRef('tests', new Int32(1), 'test'),
        decimal: Decimal128.fromString('100'),
        double: new Double(10.1),
        int32: new Int32(10),
        long: Long.fromNumber(200),
        maxKey: new MaxKey(),
        minKey: new MinKey(),
        objectId: ObjectID.createFromHexString('111111111111111111111111'),
        regexp: new BSONRegExp('hello world', 'i'),
        symbol: new Symbol('symbol'),
        timestamp: Timestamp.fromNumber(1000),
        int32Number: 300,
        doubleNumber: 200.2,
        longNumberIntFit: 0x19000000000000,
        doubleNumberIntFit: 19007199250000000.12
      };
    }
  }
];

describe('Extended JSON', function() {
  environments.forEach(function(env) {
    describe('environment: ' + env.name, function() {
      before(function() {
        return env.setup();
      });
      after(function() {
        return env.teardown();
      });
      beforeEach(function() {
        return env.beforeEach();
      });

      it('should correctly extend an existing mongodb module', function() {
        // Serialize the document
        var json =
          '{"_id":{"$numberInt":"100"},"gh":{"$numberInt":"1"},"binary":{"$binary":{"base64":"AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+Pw==","subType":"00"}},"date":{"$date":{"$numberLong":"1488372056737"}},"code":{"$code":"function() {}","$scope":{"a":{"$numberInt":"1"}}},"dbRef":{"$ref":"tests","$id":{"$numberInt":"1"},"$db":"test"},"decimal":{"$numberDecimal":"100"},"double":{"$numberDouble":"10.1"},"int32":{"$numberInt":"10"},"long":{"$numberLong":"200"},"maxKey":{"$maxKey":1},"minKey":{"$minKey":1},"objectId":{"$oid":"111111111111111111111111"},"regexp":{"$regularExpression":{"pattern":"hello world","options":"i"}},"symbol":{"$symbol":"symbol"},"timestamp":{"$timestamp":{"t":0,"i":1000}},"int32Number":{"$numberInt":"300"},"doubleNumber":{"$numberDouble":"200.2"},"longNumberIntFit":{"$numberLong":"7036874417766400"},"doubleNumberIntFit":{"$numberLong":"19007199250000000"}}';

        assert.equal(json, extJSON.stringify(test.doc, null, 0));
      });

      it('should correctly deserialize using strict, and non-strict mode', function() {
        // Deserialize the document using non strict mode
        var doc1 = extJSON.parse(extJSON.stringify(test.doc, null, 0), { strict: false });

        // Validate the values
        assert.equal(300, doc1.int32Number);
        assert.equal(200.2, doc1.doubleNumber);
        assert.equal(0x19000000000000, doc1.longNumberIntFit);
        assert.equal(19007199250000000.12, doc1.doubleNumberIntFit);

        // Deserialize the document using strict mode
        doc1 = extJSON.parse(extJSON.stringify(test.doc, null, 0), { strict: true });

        // Validate the values
        expect(doc1.int32Number._bsontype).to.equal('Int32');
        expect(doc1.doubleNumber._bsontype).to.equal('Double');
        expect(doc1.longNumberIntFit._bsontype).to.equal('Long');
        expect(doc1.doubleNumberIntFit._bsontype).to.equal('Long');
      });

      it('should correctly serialize, and deserialize using built-in BSON', function() {
        // Create ExtJSON instance
        var Int32 = extJSON.BSON.Int32;
        // Create a doc
        var doc1 = {
          int32: new Int32(10)
        };

        // Serialize the document
        var text = extJSON.stringify(doc1, null, 0);
        expect(text).to.equal('{"int32":{"$numberInt":"10"}}');

        // Deserialize the json in strict and non strict mode
        var doc2 = extJSON.parse(text, { strict: true });
        expect(doc2.int32._bsontype).to.equal('Int32');
        doc2 = extJSON.parse(text, { strict: false });
        expect(doc2.int32).to.equal(10);
      });

      it('should correctly serialize bson types when they are values', function() {
        var Int32 = extJSON.BSON.Int32;
        var serialized = extJSON.stringify(new ObjectID('591801a468f9e7024b6235ea'));
        expect(serialized).to.equal('{"$oid":"591801a468f9e7024b6235ea"}');
        serialized = extJSON.stringify(new Int32(42));
        expect(serialized).to.equal('{"$numberInt":"42"}');
        serialized = extJSON.stringify({
          _id: { $nin: [new ObjectID('591801a468f9e7024b6235ea')] }
        });
        expect(serialized).to.equal('{"_id":{"$nin":[{"$oid":"591801a468f9e7024b6235ea"}]}}');

        serialized = extJSON.stringify(new Binary(new Uint8Array([1, 2, 3, 4, 5])));
        expect(serialized).to.equal('{"$binary":{"base64":"AQIDBAU=","subType":"00"}}');
      });

      it('should correctly parse null values', function() {
        expect(extJSON.parse('null')).to.be.null;
        expect(extJSON.parse('[null]')[0]).to.be.null;

        var input = '{"result":[{"_id":{"$oid":"591801a468f9e7024b623939"},"emptyField":null}]}';
        var parsed = extJSON.parse(input, { strict: false });

        assert.deepEqual(parsed, {
          result: [{ _id: new ObjectID('591801a468f9e7024b623939'), emptyField: null }]
        });
      });

      it('should correctly throw when passed a non-string to parse', function() {
        expect(() => {
          extJSON.parse({}, { strict: true });
        }).to.throw;
      });

      it('should allow relaxed parsing', function() {
        const dt = new Date(1452124800000);
        const inputObject = {
          int: { $numberInt: '500' },
          long: { $numberLong: '42' },
          double: { $numberDouble: '24' },
          date: { $date: { $numberLong: '1452124800000' } }
        };

        const parsed = extJSON.parse(JSON.stringify(inputObject), { relaxed: true });
        expect(parsed).to.eql({
          int: 500,
          long: 42,
          double: 24,
          date: dt
        });
      });

      it('should allow regexp', function() {
        const parsedRegExp = extJSON.stringify({ test: /some-regex/i }, { relaxed: true });
        const parsedBSONRegExp = extJSON.stringify(
          { test: new BSONRegExp('some-regex', 'i') },
          { relaxed: true }
        );
        expect(parsedRegExp).to.eql(parsedBSONRegExp);
      });
    });
  });
});
