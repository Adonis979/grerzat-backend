const mongoose = require("mongoose");
const Joi = require("joi");

const Product = mongoose.model(
  "Product",
  new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: new Date() },
    price: { type: String, required: true },
    currency: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    peopleCategory: { type: String, required: true },
    clothesCategory: { type: String, required: true },
    photos: {
      type: [String],
      required: true,
      default: [], // Optional: specify a default value for the array
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  })
);

function validateProduct(product) {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(5).required(),
    price: Joi.string().required(),
    currency: Joi.string().required(),
    size: Joi.string().required(),
    color: Joi.string().required(),
    peopleCategory: Joi.string().required(),
    clothesCategory: Joi.string().required(),
    photos: Joi.array().items(Joi.string()).min(1),
  }).validate(product);
  return schema;
}

exports.Product = Product;
exports.validate = validateProduct;
