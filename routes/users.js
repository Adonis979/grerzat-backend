const router = require("express").Router();
const auth = require("../middleware/auth");
const { Code, validateCode } = require("../models/Code");
const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const { UserType } = require("../models/UserType");
const { EmailVerification } = require("../utils/email-verification");

// Get the users info
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password -isAdmin")
    .populate({
      path: "userType",
      select: "-_id -__v",
    });
  return res.status(200).json({ user });
});

// Update the user
router.put("/update", auth, async (req, res) => {
  const user_id = req.user._id;
  const { username, email, profilePicture } = req.body;
  try {
    const user = await User.findById(user_id)
      .select("-password -isAdmin")
      .populate({
        path: "userType",
        select: "-_id -__v",
      });
    if (!user) {
      return res
        .status(401)
        .json({ message: "No user with this specific id was found" });
    }
    // Update the user object with the new values
    if (username) {
      user.username = username;
    }
    if (email) {
      user.email = email;
    }
    if (profilePicture) {
      user.profilePicture = profilePicture;
    }

    // Save the updated user object
    await user.save();

    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
  }
});

// Verify Email
router.patch("/verify/email", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ message: "User cannot be found" });
    }

    const userType = await UserType.findById(user.userType);
    userType.isVerified = "3";
    await userType.save();
    return res
      .status(200)
      .json({ message: "User has been verified successfully", status: "3" });
  } catch (error) {
    console.log(error);
  }
});

router.patch("/send/email/profile", auth, async (req, res) => {
  const token = req.header("x-auth-token");
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(400).json({ message: "No user with this id was found" });
  }
  EmailVerification(user.email, token);

  return res.status(200).json({ message: "Email Verification sent" });
});

router.delete("/delete", auth, async (req, res) => {
  const user_id = req.user._id;
  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(401).json({ message: "Cannot find user to delete" });
    }

    await UserType.deleteOne({ _id: user.userType._id });
    await User.deleteOne({ _id: user_id });
    return res.status(200).json({ message: "User deleted succesfully" });
  } catch (error) {
    return res.status(500).json({ messaga: "Something went wrong" });
  }
});

// code validation and password reset
router.post("/forgot-password/reset", async (req, res) => {
  const { code, email, newPassword } = req.body;
  const result = validateCode({ code, email });
  if (result.error) {
    return res.status(400).json({ message: result.error.details[0].message });
  }
  try {
    const codeObject = await Code.findOne({ email });
    const dbCode = await Code.findOne({ code });
    if (codeObject.failedAttempts >= 5) {
      await codeObject.deleteOne({ email });
      return res
        .status(403)
        .json({ message: "To many failed attempts, try another code" });
    }
    if (!dbCode) {
      codeObject.failedAttempts += 1;
      await codeObject.save();
      return res.status(401).json({ message: "Cannot find code" });
    }
    if (dbCode.expireDate < Date.now()) {
      return res.status(404).json({ message: "Code has expired" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User cannot be found" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    await dbCode.deleteOne({ code });
    return res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.log(error);
  }
});

// reset password with credentials(meaning from profile)
router.put("/reset-password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (newPassword.length < 8) {
    return res
      .status(402)
      .json({ message: "Password length must be more than 8 characters" });
  }
  if (oldPassword === newPassword) {
    return res
      .status(403)
      .json({ message: "Old Password and new password cannot be the same" });
  }
  const user_id = req.user._id;
  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(400).json({ message: "No user was found" });
    }
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Wrong old password" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
