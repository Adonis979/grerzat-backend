const { User, validate } = require("../models/User");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const jwt = require("jsonwebtoken");

//Register a user
router.post("/register", async (req, res) => {
  const { username, email, password, phoneNumber, type } = req.body;

  let user;
  const result = validate(req.body);
  if (result.error) {
    return res.status(400).json({ message: result.error.details[0].message });
  }

  // Check if there's a user already
  let userExistent = await User.findOne({ email });
  if (userExistent) return res.status(400).send("User already exist");

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a user object
  user = new User({
    username,
    email,
    password: hashedPassword,
    phoneNumber,
    type,
  });

  // Send it to db
  try {
    await user.save();
    return res.status(200).json({ message: "Succesful register" });
  } catch (error) {
    console.log(error);
  }
});

// Login with a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //Validating req.body
  const result = validate(req.body);
  if (result.error) {
    res.status(400).json({ message: result.error.details[0].message });
  }

  // Validating user and giving response
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email or password wrong" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Email or password" });
    }
    if (user.type === "business") {
      if (user.isVerified === "0") {
        return res.status(410).json({ message: "User has not been verified" });
      } else if (user.isVerified === "1") {
        return res
          .status(411)
          .json({ message: "User has not verified his/her number" });
      } else if (user.isVerified === "2") {
        return res
          .status(412)
          .json({ message: "User has not verified his/her email" });
      }
    }
    const token = jwt.sign({ _id: user._id }, process.env.jwtPrivateKey);
    res.status(200).json({ token: token, user: user });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
