'use strict';

var extJSON = require('..'),
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
    'Current BSON implementation of timestamp/long cannot hold these values - 1 too large.',
  'Timestamp with high-order bit set on both seconds and increment (not UINT32_MAX)':
    'Current BSON implementation of timestamp/long cannot hold these values - 1 too large.'
};

describe('BSON Corpus Tests:', function() {
  findScenarios().forEach(scenario => {
    var scenarioData = scenario[1],
      deprecated = scenarioData.deprecated,
      description = scenarioData.description,
      valid = scenarioData.valid || [];

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

        // invalid, but still parsable, EJSON. if provided, make sure that we
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
