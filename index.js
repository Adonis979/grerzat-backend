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
const corsOptions = {
  origin: "https://grerezat.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/product", productRoute);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`backend server running on http://localhost:${port}`);
});
