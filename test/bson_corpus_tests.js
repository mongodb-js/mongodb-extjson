'use strict';

var extJSON = require('..'),
  //BSON = require('../../js-bson'),
  BSON = require('bson'),
  expect = require('chai').expect,
  fs = require('fs'),
  path = require('path');

function findScenarios() {
  return fs
    .readdirSync(path.join(__dirname, 'bson-corpus'))
    .filter(x => x.indexOf('json') !== -1)
    .map(x => [x, fs.readFileSync(path.join(__dirname, 'bson-corpus', x), 'utf8')])
    .map(x => [path.basename(x[0], '.json'), JSON.parse(x[1])]);
}

function nativeToBson(native) {
  var b = new BSON();
  var serializeOptions = {
    ignoreUndefined: false
  };
  return b.serialize(native, serializeOptions);
}

function bsonToNative(bson) {
  var deserializeOptions = {
    bsonRegExp: true,
    promoteLongs: true,
    promoteValues: false
  };
  var b = new BSON();
  return b.deserialize(bson, deserializeOptions);
}

function jsonToNative(json) {
  return extJSON.parse(json);
}

function nativeToCEJSON(native) {
  return extJSON.stringify(native);
}

function nativeToREJSON(native) {
  return extJSON.stringify(native, { relaxed: true });
}

function normalize(cEJ) {
  return JSON.stringify(JSON.parse(cEJ));
}

var skip = {
  'Timestamp with high-order bit set on both seconds and increment':
    'Current BSON implementation of timestamp/long cannot hold these values - 1 too large.'
};

var modifiedDoubles = {
  '+1.0': { canonical_extjson: '{"d":{"$numberDouble":"1"}}' },
  '-1.0': { canonical_extjson: '{"d":{"$numberDouble":"-1"}}' },
  '1.23456789012345677E+18': { canonical_extjson: '{"d":{"$numberDouble":"1234567890123456800"}}' },
  '-1.23456789012345677E+18': {
    canonical_extjson: '{"d":{"$numberDouble":"-1234567890123456800"}}'
  },
  '0.0': { canonical_extjson: '{"d":{"$numberDouble":"0"}}' },
  '-0.0': {
    canonical_extjson: '{"d":{"$numberDouble":"0"}}',
    canonical_bson: '10000000016400000000000000000000'
  }
};

var modifiedMultitype = {
  'All BSON types': {
    canonical_extjson:
      '{"_id":{"$oid":"57e193d7a9cc81b4027498b5"},"Symbol":"symbol","String":"string","Int32":{"$numberInt":"42"},"Int64":{"$numberLong":"42"},"Double":{"$numberDouble":"-1"},"Binary":{"$binary":{"base64":"o0w498Or7cijeBSpkquNtg==","subType":"03"}},"BinaryUserDefined":{"$binary":{"base64":"AQIDBAU=","subType":"80"}},"Code":{"$code":"function() {}"},"CodeWithScope":{"$code":"function() {}","$scope":{}},"Subdocument":{"foo":"bar"},"Array":[{"$numberInt":"1"},{"$numberInt":"2"},{"$numberInt":"3"},{"$numberInt":"4"},{"$numberInt":"5"}],"Timestamp":{"$timestamp":{"t":42,"i":1}},"Regex":{"$regularExpression":{"pattern":"pattern","options":""}},"DatetimeEpoch":{"$date":{"$numberLong":"0"}},"DatetimePositive":{"$date":{"$numberLong":"2147483647"}},"DatetimeNegative":{"$date":{"$numberLong":"-2147483648"}},"True":true,"False":false,"DBPointer":{"$ref":"collection","$id":{"$oid":"57e193d7a9cc81b4027498b1"}},"DBRef":{"$ref":"collection","$id":{"$oid":"57fd71e96e32ab4225b723fb"},"$db":"database"},"Minkey":{"$minKey":1},"Maxkey":{"$maxKey":1},"Null":null,"Undefined":null}',
    canonical_bson:
      '48020000075f69640057e193d7a9cc81b4027498b50253796d626f6c000700000073796d626f6c0002537472696e670007000000737472696e670010496e743332002a00000012496e743634002a0000000000000001446f75626c6500000000000000f0bf0542696e617279001000000003a34c38f7c3abedc8a37814a992ab8db60542696e61727955736572446566696e656400050000008001020304050d436f6465000e00000066756e6374696f6e2829207b7d000f436f64655769746853636f7065001b0000000e00000066756e6374696f6e2829207b7d00050000000003537562646f63756d656e74001200000002666f6f0004000000626172000004417272617900280000001030000100000010310002000000103200030000001033000400000010340005000000001154696d657374616d7000010000002a0000000b5265676578007061747465726e0000094461746574696d6545706f6368000000000000000000094461746574696d65506f73697469766500ffffff7f00000000094461746574696d654e656761746976650000000080ffffffff085472756500010846616c73650000034442506f696e746572002b0000000224726566000b000000636f6c6c656374696f6e00072469640057e193d7a9cc81b4027498b100034442526566003d0000000224726566000b000000636f6c6c656374696f6e00072469640057fd71e96e32ab4225b723fb02246462000900000064617461626173650000ff4d696e6b6579007f4d61786b6579000a4e756c6c000a556e646566696e65640000',
    converted_extjson:
      '{"_id":{"$oid":"57e193d7a9cc81b4027498b5"},"Symbol":"symbol","String":"string","Int32":{"$numberInt":"42"},"Int64":{"$numberLong":"42"},"Double":{"$numberDouble":"-1"},"Binary":{"$binary":{"base64":"o0w498Or7cijeBSpkquNtg==","subType":"03"}},"BinaryUserDefined":{"$binary":{"base64":"AQIDBAU=","subType":"80"}},"Code":{"$code":"function() {}"},"CodeWithScope":{"$code":"function() {}","$scope":{}},"Subdocument":{"foo":"bar"},"Array":[{"$numberInt":"1"},{"$numberInt":"2"},{"$numberInt":"3"},{"$numberInt":"4"},{"$numberInt":"5"}],"Timestamp":{"$timestamp":{"t":42,"i":1}},"Regex":{"$regularExpression":{"pattern":"pattern","options":""}},"DatetimeEpoch":{"$date":{"$numberLong":"0"}},"DatetimePositive":{"$date":{"$numberLong":"2147483647"}},"DatetimeNegative":{"$date":{"$numberLong":"-2147483648"}},"True":true,"False":false,"DBPointer":{"$ref":"collection","$id":{"$oid":"57e193d7a9cc81b4027498b1"}},"DBRef":{"$ref":"collection","$id":{"$oid":"57fd71e96e32ab4225b723fb"},"$db":"database"},"Minkey":{"$minKey":1},"Maxkey":{"$maxKey":1},"Null":null,"Undefined":null}',
    converted_bson:
      '48020000075f69640057e193d7a9cc81b4027498b50253796d626f6c000700000073796d626f6c0002537472696e670007000000737472696e670010496e743332002a00000012496e743634002a0000000000000001446f75626c6500000000000000f0bf0542696e617279001000000003a34c38f7c3abedc8a37814a992ab8db60542696e61727955736572446566696e656400050000008001020304050d436f6465000e00000066756e6374696f6e2829207b7d000f436f64655769746853636f7065001b0000000e00000066756e6374696f6e2829207b7d00050000000003537562646f63756d656e74001200000002666f6f0004000000626172000004417272617900280000001030000100000010310002000000103200030000001033000400000010340005000000001154696d657374616d7000010000002a0000000b5265676578007061747465726e0000094461746574696d6545706f6368000000000000000000094461746574696d65506f73697469766500ffffff7f00000000094461746574696d654e656761746976650000000080ffffffff085472756500010846616c73650000034442506f696e746572002b0000000224726566000b000000636f6c6c656374696f6e00072469640057e193d7a9cc81b4027498b100034442526566003d0000000224726566000b000000636f6c6c656374696f6e00072469640057fd71e96e32ab4225b723fb02246462000900000064617461626173650000ff4d696e6b6579007f4d61786b6579000a4e756c6c000a556e646566696e65640000'
  }
};

describe('BSON Corpus Tests:', function() {
  findScenarios().forEach(scenario => {
    var scenarioData = scenario[1],
      deprecated = scenarioData.deprecated,
      description = scenarioData.description,
      valid = scenarioData.valid || [];

    // since doubles are formatted differently in JS than in corpus, overwrite expected results
    if (description === 'Double type') {
      valid.forEach(v => {
        if (modifiedDoubles[v.description]) {
          Object.assign(v, modifiedDoubles[v.description]);
        }
      });
      // multitype test has a double nested in object, so change those expected values too
    } else if (description === 'Multiple types within the same document') {
      valid.forEach(v => {
        if (modifiedMultitype[v.description]) {
          Object.assign(v, modifiedMultitype[v.description]);
        }
      });
    }

    valid.forEach(v => {
      // tests we need to skip for various reasons
      if (skip.hasOwnProperty(v.description)) {
        it.skip(v.description, () => {});
        return;
      }

      it(description + ' - ' + v.description, done => {
        // read in test case data. if this scenario is for a deprecated
        // type, we want to use the "converted" BSON and EJSON, which
        // use the upgraded version of the deprecated type. otherwise,
        // just use canonical.
        if (deprecated) {
          var cB = new Buffer(v.converted_bson, 'hex'),
            cEJ = normalize(v.converted_extjson);
        } else {
          cB = new Buffer(v.canonical_bson, 'hex');
          cEJ = normalize(v.canonical_extjson);
        }

        // convert inputs to native Javascript objects
        var nativeFromCB = bsonToNative(cB),
          nativeFromCEJ = jsonToNative(cEJ);

        // round tripped EJSON should match the original
        expect(nativeToCEJSON(nativeFromCEJ)).to.equal(cEJ);

        // invalid, but still parseable, EJSON. if provided, make sure that we
        // properly convert it to canonical EJSON and BSON.
        if (v.degenerate_extjson) {
          let dEJ = normalize(v.degenerate_extjson),
            nativeFromDEJ = jsonToNative(dEJ),
            roundTrippedDEJ = nativeToCEJSON(nativeFromDEJ);
          expect(roundTrippedDEJ).to.equal(cEJ);
          if (!v.lossy) expect(nativeToBson(nativeFromDEJ)).to.deep.equal(cB);
        }

        // as long as conversion isn't lossy (i.e. BSON can represent everything in
        // the EJSON), make sure EJSON -> native -> BSON matches canonical BSON.
        if (!v.lossy) expect(nativeToBson(nativeFromCEJ)).to.deep.equal(cB);

        // the reverse direction, BSON -> native -> EJSON, should match canonical EJSON.
        expect(nativeToCEJSON(nativeFromCB)).to.equal(cEJ);

        if (v.relaxed_extjson) {
          let rEJ = normalize(v.relaxed_extjson);
          // BSON -> native -> relaxed EJSON matches provided
          expect(nativeToREJSON(nativeFromCB)).to.equal(rEJ);
          // relaxed EJSON -> native -> relaxed EJSON unchanged
          expect(nativeToREJSON(jsonToNative(rEJ))).to.equal(rEJ);
        }

        done();
      });
    });
  });
});
