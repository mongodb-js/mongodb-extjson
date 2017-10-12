'use strict';

function toExtendedJSON(obj) {
  if (obj.scope) {
    return { $code: obj.code, $scope: obj.scope };
  }

  return { $code: obj.code };
}

function fromExtendedJSON(BSON, doc) {
  return new BSON.Code(doc.$code, doc.$scope);
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
