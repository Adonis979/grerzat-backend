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
    peopleCategory: { type: String, required: true },
    clothesCategory: { type: String, required: true },
    photo: {
      type: [String],
      required: true,
      default: [], // Optional: specify a default value for the array
    },
    publisher: {
      name: { type: String },
      id: { type: String },
    },
  })
);

function validateProduct(product) {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(5).required(),
    price: Joi.string().required().required(),
    currency: Joi.string().required(),
    size: Joi.string().required(),
    peopleCategory: Joi.string().required(),
    clothesCategory: Joi.string().required(),
    photo: Joi.array().items(Joi.string()),
    publisher: Joi.object({
      name: Joi.string().required(),
      id: Joi.string().required(),
    }),
  }).validate(product);
  return schema;
}

exports.Product = Product;
exports.validate = validateProduct;
