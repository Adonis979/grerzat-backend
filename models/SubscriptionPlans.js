const mongoose = require('mongoose');
const Joi = require('joi');

const SubscriptionPlans = mongoose.model("SubscriptionPlans", new mongoose.Schema({
    startingDate: {type:Date, required:true},
    endDate: {type:Date, required:true},
    subscriptionPlan: {type:String, required: true},
    amountPayed: {type:Number, required:true},
    paymentUsed:{type:String, required:true}
}))

function validateSubscriptionPlan(subscriptionPlan) {
    return Joi.object({
        endDate:Joi.date(),
        subscriptionPlan:Joi.string(),
        amountPayed:Joi.number(),
        paymentUsed:Joi.string()
    })
}

exports.SubscriptionPlans = SubscriptionPlans;
exports.validateSubscriptionPlan = validateSubscriptionPlan;