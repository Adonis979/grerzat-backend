const router = require("express").Router();
const auth = require("../middleware/auth");
const { User } = require("../models/User");

// Get the users info
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -isAdmin");
  res.status(200).json({ user });
});

// Update the user
router.put("/update", auth, async (req, res) => {
  const user_id = req.user._id;
  const { username, email, profilePicture } = req.body;
  try {
    const user = await User.findById(user_id).select("-password -isAdmin");
    console.log(user, "user");
    if (!user) {
      res
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

    res.status(200).send(user);
  } catch (error) {
    console.log(error);
  }
});

router.patch("/verify/email", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(400).json({ message: "User cannot be found" });
    }
    user.isVerified = "3";
    await user.save();
    res
      .status(200)
      .json({ message: "User has been verified successfully", status: "3" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
