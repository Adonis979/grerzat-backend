// const path = require("path");
// const multer = require("multer");

// const DIR = "uploads/";

// let storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, DIR);
//   },
//   filename: function (req, file, cb) {
//     const fileName = file.originalname.toLowerCase().split(" ").join("-");
//     cb(null, fileName);
//   },
// });

// let upload = multer({
//   storage: storage,
//   fileFilter: function (req, file, callback) {
//     if (
//       file.mimetype == "image/png" ||
//       file.mimetype == "image/jpg" ||
//       file.mimetype == "image/jpeg"
//     ) {
//       callback(null, true);
//     } else {
//       console.log("Only png or jpg accepted");
//       callback(null, false);
//     }
//   },
// });

// module.exports = upload;
