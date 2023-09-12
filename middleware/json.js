const express = require("express");

function json(req,res, next) {
    if (req.originalUrl === "/api/payment/stripe/status") {
        next();
    } else {
        express.json()(req, res, next);
    }
}

module.exports = json;