const router = require("express").Router();
const auth = require("../middleware/auth");
const { User } = require("../models/User");

// example
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -isVerified -type -profilePicture -isAdmin"
  );
  res.send(user);
});

module.exports = router;
