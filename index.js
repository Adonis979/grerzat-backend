require("dotenv").config();
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const json = require('./middleware/json')

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/products");
const businessRoute = require("./routes/business");
const paymentRoute = require("./routes/payment");
const { DBConnection } = require("./utils/db-connection");
const paypalConfiguration = require('./utils/paypal-configuration')

dotenv.config();
DBConnection();
paypalConfiguration();


// middleware
app.use(json);
app.use(morgan("common"));
app.use(cors());
app.use(express.static("public"));
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/product", productRoute);
app.use("/api/business", businessRoute);
app.use("/api/payment", paymentRoute);
require("./prod")(app);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`backend server running on http://localhost:${5000}`);
});
