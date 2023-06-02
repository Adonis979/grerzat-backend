const router = require("express").Router();
const auth = require("../middleware/auth");
const { validate, Product } = require("../models/Product");
const Joi = require("joi");

router.post("/add-product", auth, async (req, res) => {
  const {
    title,
    description,
    peopleCategory,
    clothesCategory,
    size,
    color,
    price,
    currency,
    photos,
  } = req.body.product;

  const result = validate(req.body.product);
  if (result.error) {
    return res.status(400).json({ message: result.error.details[0].message });
  }

  const newProduct = new Product({
    title,
    description,
    peopleCategory,
    clothesCategory,
    size,
    color,
    price,
    currency,
    photos,
    date: new Date(),
    publisher: req.user._id,
  });
  try {
    await Product.create(newProduct);
    res.status(200).json({ message: "Product added succesfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/", async (req, res) => {
  try {
    const allProducts = await Product.find().populate(
      "publisher",
      "username email phoneNumber type profilePicture -_id"
    );
    res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const schema = Joi.required();
  const result = schema.validate(id);
  if (result.error) {
    if (result.error) {
      return res.status(400).json({ message: result.error.details[0].message });
    }
  }
  try {
    const product = await Product.findById(id);
    res.status(200).json({ product });
  } catch (error) {
    res.status(404).json({ message: "Product with this id not found" });
  }
});

module.exports = router;
