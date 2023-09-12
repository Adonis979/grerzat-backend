const mongoose = require("mongoose");

const UserType = mongoose.model(
  "UserType",
  new mongoose.Schema({
    type: {
      type: String,
      enum: ["business", "normal"],
      required: true,
    },
    isVerified: { type: String, default: "0" },
    subscriptionDate: {type:Date, default:null},
    isAdmin: {
      type: Boolean,
      default: false,
    },
    date: { type: Date, default: new Date() },
  })
);

exports.UserType = UserType;
