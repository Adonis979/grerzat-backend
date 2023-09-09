const { User, validate } = require("../models/User");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { ForgotPasswordEmail } = require("../utils/email-verification");
const { generateCode } = require("../utils/code-generator");
const { Code } = require("../models/Code");
const { UserType } = require("../models/UserType");

//Register a user
router.post("/register", async (req, res) => {
  const { username, email, password, phoneNumber, type } = req.body;

  let user;
  const result = validate(req.body);
  if (result.error) {
    return res.status(400).json({ message: result.error.details[0].message });
  }

  try {
    // Check if there's a user alreadxy
    let userExistent = await User.findOne({ email }).populate("userType");
    if (userExistent) {
      if (userExistent.userType.isVerified === "4") {
        const token = jwt.sign(
          { _id: userExistent._id },
          process.env.jwtPrivateKey,
          {
            expiresIn: "7d",
          }
        );
        return res
          .status(201)
          .json({ message: "User needs to finish paymennt", token: token });
      }
      return res.status(400).send("User already exist");
    }

    let isVerified = "0";

    if (type === "business") {
      isVerified = "4";
    }

    const userType = new UserType({
      type,
      isVerified,
    });

    await userType.save();

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a user object
    user = new User({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      userType: userType._id,
    });

    await user.save();

    if (type === "business") {
      const token = jwt.sign({ _id: user._id }, process.env.jwtPrivateKey, {
        expiresIn: "7d",
      });
      return res
        .status(418)
        .json({ message: "Procced with payment", token: token });
    } else {
      return res.status(200).json({ message: "User registered successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Login with a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //Validating req.body
  const result = validate(req.body);
  if (result.error) {
    return res.status(400).json({ message: result.error.details[0].message });
  }

  // Validating user and giving response
  try {
    const user = await User.findOne({ email }).populate("userType");
    if (!user) {
      return res
        .status(400)
        .json({ message: "Cannot find a user with this email address" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.jwtPrivateKey, {
      expiresIn: "7d",
    });

    if (user.userType.type === "business") {
      if (user.userType.isVerified === "0") {
        return res.status(410).json({ message: "User has not been verified" });
      } else if (user.userType.isVerified === "1") {
        return res
          .status(411)
          .json({ message: "User has not verified his/her number" });
      } else if (user.userType.isVerified === "2") {
        return res
          .status(412)
          .json({ message: "User has not verified his/her email" });
      } else if (user.userType.isVerified === "4") {
        return res
          .status(201)
          .json({ message: "User has not finished payment", token: token });
      }
    }
    return res.status(200).json({ token: token });
  } catch (error) {
    console.log(error);
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
    await ForgotPasswordEmail(email, user, code);
    return res.status(200).json({ message: "Forgot password email sent" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
