'use strict';

function toExtendedJSON() {
  return { $maxKey: 1 };
}

function fromExtendedJSON(BSON) {
  return new BSON.MaxKey();
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
