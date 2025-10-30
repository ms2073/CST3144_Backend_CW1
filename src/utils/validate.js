const { ObjectId } = require(../db/mongo);

function isNonEmptyString(value) {
  return typeof value === string && value.trim().length > 0;
}

function toObjectId(id) {
  if (id instanceof ObjectId) return id;
  if (typeof id === string && ObjectId.isValid(id)) return new ObjectId(id);
  throw Object.assign(new Error(Invalid
