const mongoose = require("mongoose");

function DbConnection() {
  mongoose
    .connect(process.env.MONGO_URL, { useNewUrlParser: true })
    .then(() => console.log("conncted to db"))
    .catch((error) => {
      console.log(error);
    });
}

exports.DBConnection = DbConnection;
