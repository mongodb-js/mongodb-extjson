var ExtJSON = require('../'),
  assert = require('assert');

describe('Extended JSON', () => {
  it('should correctly extend the existing mongodb module', (done) => {
    var mongodb = ExtJSON.extend(require('mongodb'));
    // console.dir(mongodb)
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

    // Document to insert
    var doc = {
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

    // Serialize the document
    console.log(JSON.stringify(doc, null, 0))
    assert.equal(
      '{"_id":{"$numberInt":"100"},"gh":{"$numberInt":"1"},"binary":{"$binary":"AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+Pw==","$type":"00"},"date":"2017-03-01T12:40:56.737Z","code":{"$code":"function() {}","$scope":{"a":{"$numberInt":"1"}}},"dbRef":{"$ref":"tests","$id":{"$numberInt":"1"},"$db":"test"},"decimal":{"$numberDecimal":"100"},"double":{"$numberDouble":"10.1"},"int32":{"$numberInt":"10"},"long":{"$numberLong":"200"},"maxKey":{"$maxKey":1},"minKey":{"$minKey":1},"objectId":{"$oid":"111111111111111111111111"},"regexp":{"$regex":"hello world","$options":"i"},"symbol":{"$symbol":"symbol"},"timestamp":{"$timestamp":"1000"},"int32Number":300,"doubleNumber":200.2,"longNumberIntFit":7036874417766400,"doubleNumberIntFit":19007199250000000}',
      JSON.stringify(doc, null, 0)
    )
    done();
  });
});
