const express = require("express");

function json(req,res, next) {
    if (req.originalUrl === "/api/payment/stripe/callback") {
        next();
    } else {
        express.json()(req, res, next);
    }
}

module.exports = json;