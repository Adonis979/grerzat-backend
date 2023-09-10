const router = require("express").Router();
const { BusinessProduct } = require("../models/BusinessProduct");
const auth = require("../middleware/auth");
const paypal = require("paypal-rest-sdk");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
const { User } = require("../models/User");
const { UserType } = require("../models/UserType");
const express = require("express");

// PayPal Post Request for checkout
router.post("/paypal", auth, async (req, res) => {
  const { success_url, cancel_url, item_id } = req.body;
  if (!success_url || !cancel_url || !item_id) {
    return res.status(400).json({ message: "Wrong parameters" });
  }

  let product;

  try {
    product = await BusinessProduct.findById(item_id);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }

  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: success_url,
      cancel_url: cancel_url,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: product.name,
              sku: "001",
              price: product.price,
              currency: product.currency,
              quantity: product.quantity,
            },
          ],
        },
        amount: {
          currency: product.currency,
          total: product.price,
        },
        description: product.description,
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      console.log(error);
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          return res.status(200).json({ redirect_url: payment.links[i].href });
        }
      }
    }
  });
});

// PayPal Status check and payment execution
router.post("/paypal/status", auth, async (req, res) => {
  const { payerId, paymentId, item_id } = req.body;

  let product;
  try {
    product = await BusinessProduct.findById(item_id);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: product.currency,
          total: product.price,
        },
      },
    ],
  };

  // Obtains the transaction details from paypal
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    async function (error, payment) {
      //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        try {
          const user = await User.findById(req.user._id);
          const userType = await UserType.findById(user.userType);
          userType.isVerified = "3";
          userType.save();
        } catch (error) {
          return res.status(500).json({ message: "Something went wrong" });
        }

        const collectionName = "paypal-logs";
        const dataToAdd = payment; // Assuming you're sending JSON data in the request body

        let tempModel;

        // Check if the model already exists
        if (mongoose.modelNames().includes(collectionName)) {
          tempModel = mongoose.model(collectionName);
        } else {
          // Create a temporary model on the fly
          tempModel = mongoose.model(
            collectionName,
            new mongoose.Schema({}, { strict: false })
          );
        }
        // Insert the data into the collection
        try {
          await tempModel.create(dataToAdd);
          res.status(200).send({ message: "Payment completed succesfully" });
        } catch (error) {
          console.error("Error adding data to collection:", error);
          res.status(500).send("Error adding data to collection");
        }
      }
    }
  );
});

// Stripe post request for checkout
router.post("/stripe", auth, async (req, res) => {
  const { success_url, cancel_url, item_id } = req.body;
  if (!success_url || !cancel_url || !item_id) {
    return res.status(400).json({ message: "Wrong parameters" });
  }

  let product;

  try {
    product = await BusinessProduct.findById(item_id);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: product.name,
            },
            unit_amount: product.price * 100,
          },
          quantity: product.quantity,
        },
      ],
      client_reference_id: req.user._id,
      mode: "payment",
      success_url: success_url,
      cancel_url: cancel_url,
    });
    return res.status(200).json({ redirect_url: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Stripe Status Check
router.post(
  "/stripe/status",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.WEB_HOOK_SECRET
      );
    } catch (err) {
      console.log(err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        try {
          const session = event.data.object; // The session object contains all the data about the completed checkout session
          const userID = session.client_reference_id; // Retrieve the user ID from the custom field
          const user = await User.findById(userID);
          if (user) {
            const userType = await UserType.findById(user.userType);
            if (userType) {
              userType.isVerified = "3";
              userType.save();
              const collectionName = "stripe-logs";
              const dataToAdd = {
                paymentUsed: "stripe",
                paymentStatus: session.payment_status,
                amount: session.amount_total / 100,
                transactionDate: new Date(),
                user: user,
                userType: userType,
              };

              // Create a temporary model on the fly
              const tempModel = mongoose.model(
                collectionName,
                new mongoose.Schema({}, { strict: false })
              );
              // Insert the data into the collection
              await tempModel.create(dataToAdd);
              res
                .status(200)
                .send({ message: "Payment completed successfully" });
            }
          }
        } catch (error) {
          console.log(error);
          return res.status(500).json({ message: "Something went wrong" });
        }
        break;
      // TODO handle other event types of blla
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 res to acknowledge receipt of the event
    res.send();
  }
);
module.exports = router;
