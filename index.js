const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/products");
const cors = require("cors");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true })
  .then(() => console.log("conncted to db"))
  .catch((error) => {
    console.log(error);
  });

// midleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/product", productRoute);

app.listen(5000, () => {
  console.log("backend server runing on http://localhost:5000");
});