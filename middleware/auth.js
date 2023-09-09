const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

async function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.jwtPrivateKey);
    req.user = decoded;
    if (
      req.originalUrl !== "/api/payment/stripe" &&
      req.originalUrl !== "/api/payment/paypal" &&
      req.originalUrl !== "/api/payment/paypal/status"
    ) {
      const user = await User.findById(req.user._id).populate("userType");
      if (
        user.userType.type === "business" &&
        user.userType.isVerified !== "3"
      ) {
        return res
          .status(400)
          .json({ message: "User has not verified its profile" });
      }
    }
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid Token" });
  }
}

module.exports = auth;
