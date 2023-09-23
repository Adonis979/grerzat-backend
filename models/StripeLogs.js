const mongoose = require("mongoose");

const StripeLogs = mongoose.model("StripeLogs", new mongoose.Schema({
    transactionID: { type: String, required: true, unique:true },
    user: { type: Object, required: true },
    paymentStatus: { type: String, required: true },
    product: { type: Object, required: true },
    transactionDate: { type: Date, required: true },
}))

exports.StripeLogs = StripeLogs;