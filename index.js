const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
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

// middleware
app.use(express.json());
app.use(morgan("common"));
app.use(cors());
app.use(express.static("public"));
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/product", productRoute);
require("./prod")(app);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`backend server running on http://localhost:${5000}`);
});
