const router = require("express").Router();
const { BusinessProduct } = require("../models/BusinessProduct");

router.get("/products", async (req, res) => {
  try {
    const products = await BusinessProduct.find();
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/add/product", async (req, res) => {
  const { name, price, quantity, currency, description } = req.body;
  if (!name || !price || !quantity || !currency || !description) {
    return res.status(400).json({ message: "parameters not correct" });
  }

  const newProduct = new BusinessProduct({
    name,
    price,
    quantity,
    currency,
    description,
  });

  try {
    await newProduct.save();
    return res.status(200).json({ message: "Product added successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
