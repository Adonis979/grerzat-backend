const router = require("express").Router();
const auth = require("../middleware/auth");
const { User } = require("../models/User");

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -isAdmin");
  res.status(200).json({ user });
});

module.exports = router;
