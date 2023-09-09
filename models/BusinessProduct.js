const mongoose = require("mongoose");

const BusinessProduct = mongoose.model(
  "BusinessProduct",
  new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    price: { type: Number },
    currency: { type: String },
    quantity: { type: Number },
  })
);

exports.BusinessProduct = BusinessProduct;
