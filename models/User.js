const mongoose = require("mongoose");
const Joi = require("joi");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: { type: String, required: true, min: 3, max: 20 },
    email: { type: String, required: true, max: 50, unique: true },
    password: { type: String, required: true, min: 6 },
    phoneNumber: { type: String, default: "" },
    profilePicture: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["business", "normal"],
      required: true,
      default: "normal",
    },
    isVerified: { type: String, default: "0" },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    date: { type: Date, default: new Date() },
  })
);

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(5).max(50),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: Joi.string().min(8).required(),
    phoneNumber: Joi.string().allow(""),
    type: Joi.string().allow(""),
    profilePicture: Joi.string().allow(""),
  }).validate(user);
  return schema;
}

exports.User = User;
exports.validate = validateUser;

// Not verified 0
// Email verified 1
// Number verified 2
// Number + Email verified 3
