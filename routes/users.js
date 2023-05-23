const router = require("express").Router();
const auth = require("../middleware/auth");

router.get("/", auth, (req, res) => {
  res.send("Hey there");
});

module.exports = router;
