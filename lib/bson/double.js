'use strict';

function toExtendedJSON(obj, options) {
  if (options && options.relaxed && Number.isFinite(obj.value)) {
    return obj.value;
  }

  // NOTE: JavaScript has +0 and -0, apparently to model limit calculations. If a user
  // explicitly provided `-0` then we need to ensure the sign makes it into the output
  if (Object.is(Math.sign(obj.value), -0)) {
    return { $numberDouble: `-${obj.value.toFixed(1)}` };
  }

  let $numberDouble;
  if (Number.isInteger(obj.value)) {
    $numberDouble = obj.value.toFixed(1);
    if ($numberDouble.length >= 13) {
      $numberDouble = obj.value.toExponential(13).toUpperCase();
    }
  } else {
    $numberDouble = obj.value.toString();
  }

  return { $numberDouble: $numberDouble };
}

function fromExtendedJSON(BSON, doc, options) {
  return options && options.relaxed
    ? parseFloat(doc.$numberDouble)
    : new BSON.Double(parseFloat(doc.$numberDouble));
}

module.exports = {
  toExtendedJSON: toExtendedJSON,
  fromExtendedJSON: fromExtendedJSON
};
