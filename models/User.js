const mongoose = require("mongoose");
const Joi = require("joi");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: {type: String, required: true, min: 3, max: 20},
        email: {type: String, required: true, max: 50},
        password: {type: String, required: true, min: 6},
        phoneNumber: {type: String, default: ""},
        profilePicture: {
            type: String,
            default: "",
        },
        userType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserType",
        },
        subscriptionPlan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubscriptionPlans",
        },
    })
);

function validateUser(user) {
    return Joi.object({
        username: Joi.string().max(50),
        email: Joi.string().required(),
        password: Joi.string().min(8).required(),
        phoneNumber: Joi.string().allow(""),
        profilePicture: Joi.string().allow(""),
        type: Joi.string(),
    }).validate(user);
}

exports.User = User;
exports.validate = validateUser;

// Not verified 0
// Email verified 1
// Number verified 2
// Number + Email verified 3
