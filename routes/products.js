const router = require("express").Router();
const auth = require("../middleware/auth");
const { validate, Product } = require("../models/Product");
const { User } = require("../models/User");
const Joi = require("joi");
const upload = require("../middleware/upload");

router.post("/add-product", auth, upload.array("photo[]"), async (req, res) => {
  const product = req.body;
  const result = validate(product.product);
  if (result.error) {
    return res.status(400).json({ message: result.error.details[0].message });
  }
  const user = await User.findById(req.user._id);
  let paths = [];
  req.files.forEach(function (file, index) {
    console.log(file.mimetype, `file me index${index}`);
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/ png"
    ) {
      paths.push(file.path);
    } else return res.status(400).json({ message: "File type not supported" });
  });
  product.photo = paths;
  product.date = new Date();
  product.publisher = {
    name: user.username,
    id: user._id,
  };

  try {
    await Product.create(product);
    res.status(200).json({ message: "Product added succesfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/:id", auth, async (req, res) => {
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
