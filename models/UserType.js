const mongoose = require("mongoose");

const UserType = mongoose.model(
  "UserType",
  new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

exports.UserType = UserType;
