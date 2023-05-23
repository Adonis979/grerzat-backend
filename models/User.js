const mongoose = require("mongoose");
const Joi = require("joi");

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      username: { type: String, required: true, min: 3, max: 20 },
      email: { type: String, required: true, max: 50, unique: true },
      password: { type: String, required: true, min: 6 },
      profilePicture: {
        type: String,
        default: "",
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  )
);

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(5).max(50),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: Joi.string().min(8).required(),
  }).validate(user);
  return schema;
}

exports.User = User;
exports.validate = validateUser;
