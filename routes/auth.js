const { User, validate } = require("../models/User");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const {
  EmailVerification,
  ForgotPasswordEmail,
} = require("../utils/email-verification");
const { generateCode } = require("../utils/code-generator");
const { Code } = require("../models/Code");

//Register a user
router.post("/register", async (req, res) => {
  const { username, email, password, phoneNumber, type } = req.body;

  let user;
  const result = validate(req.body);
  if (result.error) {
    return res.status(400).json({ message: result.error.details[0].message });
  }

  try {
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

    //save it to db
    await user.save();

    if (type === "business") {
      const token = jwt.sign({ _id: user._id }, process.env.jwtPrivateKey, {
        expiresIn: "7d",
      });

      // send email
      EmailVerification(email, token);
      return res.status(201).json({
        message: `Sent a verification email to ${email}`,
      });
    } else {
      return res.status(200).json({ message: "User registered successfully" });
    }
  } catch (error) {
    console.log(error);
  }
});

// Login with a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, "email");
  //Validating req.body
  const result = validate(req.body);
  if (result.error) {
    return res.status(400).json({ message: result.error.details[0].message });
  }

  // Validating user and giving response
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Cannot find a user with this email address" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Email or password is wrong" });
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
    const token = jwt.sign({ _id: user._id }, process.env.jwtPrivateKey, {
      expiresIn: "7d",
    });
    return res.status(200).json({ token: token });
  } catch (error) {
    return res.status(500).json(error);
  }
});

//Email verification code for forget password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  let newCode;
  try {
    const user = await User.findOne({ email }).select("username");
    if (!user) {
      return res.status(400).json({
        message: "No user with this email was found, please create one first",
      });
    }
    const code = generateCode();
    newCode = new Code({
      email,
      code,
      expireDate: Date.now() + 3600000,
    });
    await newCode.save();
    ForgotPasswordEmail(email, user, code);
    return res.status(200).json({ message: "Forgot password email sent" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
