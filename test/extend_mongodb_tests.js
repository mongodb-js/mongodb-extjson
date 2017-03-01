var ExtJSON = require('../'),
  assert = require('assert');

var nodeDoc;
var browserDoc;

describe('Extended JSON', () => {
  beforeEach(function() {
    var mongodb = ExtJSON.extend(require('mongodb'));
    var Binary = mongodb.Binary,
      Code = mongodb.Code,
      DBRef = mongodb.DBRef,
      Decimal128 = mongodb.Decimal128,
      Double = mongodb.Double,
      Int32 = mongodb.Int32,
      Long = mongodb.Long,
      MaxKey = mongodb.MaxKey,
      MinKey = mongodb.MinKey,
      ObjectID = mongodb.ObjectID,
      BSONRegExp = mongodb.BSONRegExp,
      Symbol = mongodb.Symbol,
      Timestamp = mongodb.Timestamp;

    // Create a new Buffer
    var buffer = new Buffer(64);
    for(var i = 0; i < buffer.length; i++) buffer[i] = i;

    // Fix the date so test have no variable component
    var date = new Date();
    date.setTime(1488372056737);

    nodeDoc = {
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

    var mongodb = require('../lib/bson');
    var Binary = mongodb.Binary,
      Code = mongodb.Code,
      DBRef = mongodb.DBRef,
      Decimal128 = mongodb.Decimal128,
      Double = mongodb.Double,
      Int32 = mongodb.Int32,
      Long = mongodb.Long,
      MaxKey = mongodb.MaxKey,
      MinKey = mongodb.MinKey,
      ObjectID = mongodb.ObjectID,
      BSONRegExp = mongodb.BSONRegExp,
      Symbol = mongodb.Symbol,
      Timestamp = mongodb.Timestamp;

    browserDoc = {
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
  });

  it('should correctly extend the existing mongodb module', (done) => {
    // Serialize the document
    var json = '{"_id":{"$numberInt":"100"},"gh":{"$numberInt":"1"},"binary":{"$binary":"AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+Pw==","$type":"00"},"date":"2017-03-01T12:40:56.737Z","code":{"$code":"function() {}","$scope":{"a":{"$numberInt":"1"}}},"dbRef":{"$ref":"tests","$id":{"$numberInt":"1"},"$db":"test"},"decimal":{"$numberDecimal":"100"},"double":{"$numberDouble":"10.1"},"int32":{"$numberInt":"10"},"long":{"$numberLong":"200"},"maxKey":{"$maxKey":1},"minKey":{"$minKey":1},"objectId":{"$oid":"111111111111111111111111"},"regexp":{"$regex":"hello world","$options":"i"},"symbol":{"$symbol":"symbol"},"timestamp":{"$timestamp":"1000"},"int32Number":300,"doubleNumber":200.2,"longNumberIntFit":7036874417766400,"doubleNumberIntFit":19007199250000000}';
    assert.equal(json, JSON.stringify(nodeDoc, null, 0));
    done();
  });

  it('should correctly deserialize using strict and non-strict mode using nodeDoc', (done) => {
    // Create ExtJSON instance
    var extJSON = new ExtJSON();

    // Deserialize the document using non strict mode
    var doc1 = extJSON.parse(extJSON.stringify(nodeDoc, null, 0), {strict:false});

    // Validate the values
    assert.equal(300, doc1.int32Number);
    assert.equal(200.20, doc1.doubleNumber);
    assert.equal(0x19000000000000, doc1.longNumberIntFit);
    assert.equal(19007199250000000.120, doc1.doubleNumberIntFit);

    // Deserialize the document using strict mode
    var doc1 = extJSON.parse(JSON.stringify(nodeDoc, null, 0), {strict:true});

    // Validate the values
    assert.equal('Int32', doc1.int32Number._bsontype);
    assert.equal('Double', doc1.doubleNumber._bsontype);
    assert.equal('Double', doc1.longNumberIntFit._bsontype);
    assert.equal('Double', doc1.doubleNumberIntFit._bsontype);

    done();
  });

  it('should correctly deserialize using strict and non-strict mode using browserDoc', (done) => {
    // Create ExtJSON instance
    var extJSON = new ExtJSON();

    // Deserialize the document using non strict mode
    var doc1 = extJSON.parse(extJSON.stringify(browserDoc, null, 0), {strict:false});

    // Validate the values
    assert.equal(300, doc1.int32Number);
    assert.equal(200.20, doc1.doubleNumber);
    assert.equal(0x19000000000000, doc1.longNumberIntFit);
    assert.equal(19007199250000000.120, doc1.doubleNumberIntFit);

    // Deserialize the document using strict mode
    var doc1 = extJSON.parse(JSON.stringify(browserDoc, null, 0), {strict:true});

    // Validate the values
    assert.equal('Int32', doc1.int32Number._bsontype);
    assert.equal('Double', doc1.doubleNumber._bsontype);
    assert.equal('Double', doc1.longNumberIntFit._bsontype);
    assert.equal('Double', doc1.doubleNumberIntFit._bsontype);

    done();
  });

  it('should correctly serialize and deserialize using built in BSON', (done) => {
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
    done();
  });
});
