'use strict';
const ExtJSON = require('./lib/ext_json');
module.exports = {
  parse: ExtJSON.parse,
  stringify: ExtJSON.stringify,
  setBSONModule: ExtJSON.setBSONModule,
  BSON: ExtJSON.BSON
};
