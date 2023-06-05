const mongoose = require("mongoose");
const Joi = require("joi");

const Code = mongoose.model(
  "ForgetPasswordCode",
  new mongoose.Schema({
    email: { type: String, required: true },
    code: { type: Number, required: true },
    date: { type: Date, default: new Date() },
    failedAttempts: { type: Number, default: 0 },
    expireDate: { type: Date, required: true },
  })
);

function validateCode(codeObject) {
  const schema = Joi.object({
    email: Joi.string().required(),
    code: Joi.number().required(),
  }).validate(codeObject);
  return schema;
}

exports.Code = Code;
exports.validateCode = validateCode;
