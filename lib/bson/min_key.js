'use strict';

function toExtendedJSON() {
  return { $minKey: 1 };
}

function fromExtendedJSON(BSON) {
  return new BSON.MinKey();
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
