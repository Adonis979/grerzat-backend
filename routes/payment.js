const router = require("express").Router();
const {BusinessProduct} = require("../models/BusinessProduct");
const auth = require("../middleware/auth");
const paypal = require("paypal-rest-sdk");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
const {User} = require("../models/User");
const express = require("express");
const {addSubscriptionForBusinessUser} = require("../utils/AddSubscriptionForBusinessUser");
const {uid} = require("uid");
const {StripeLogs} = require('../models/StripeLogs')

// PayPal Post Request for checkout
router.post("/paypal", auth, async (req, res) => {
    const {success_url, cancel_url, item_id} = req.body;
    if (!success_url || !cancel_url || !item_id) {
        return res.status(400).json({message: "Wrong parameters"});
    }

    let product;

    try {
        product = await BusinessProduct.findById(item_id);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Something went wrong"});
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
                    return res.status(200).json({redirect_url: payment.links[i].href});
                }
            }
        }
    });
});

// PayPal Status check and payment execution
router.post("/paypal/status", auth, async (req, res) => {
    const {payerId, paymentId, item_id} = req.body;

    let product;
    try {
        product = await BusinessProduct.findById(item_id);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Something went wrong"});
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
                    await addSubscriptionForBusinessUser(req, res, product, 'PayPal')
                } catch
                    (error) {
                    return res.status(500).json({message: "Something went wrong"});
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
                        new mongoose.Schema({}, {strict: false})
                    );
                }
                // Insert the data into the collection
                try {
                    await tempModel.create(dataToAdd);
                    res.status(200).send({message: "Payment completed succesfully"});
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
    const {success_url, cancel_url, item_id} = req.body;
    if (!success_url || !cancel_url || !item_id) {
        return res.status(400).json({message: "Wrong parameters"});
    }
    let product;
    try {
        product = await BusinessProduct.findById(item_id);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Something went wrong"});
    }
    const transactionID = uid(25);
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
            metadata: {
                userID: req.user._id,
                transactionID: transactionID,
                productID: item_id
            },
            mode: "payment",
            success_url: success_url,
            cancel_url: cancel_url,
        });
        return res.status(200).json({redirect_url: session.url});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Something went wrong"});
    }
});

// Stripe Status Check
router.post(
    "/stripe/callback",
    express.raw({type: "application/json"}),
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
                    const {metadata} = session;
                    const userID = metadata.userID
                    const user = await User.findById(userID);
                    const product = await BusinessProduct.findById(metadata.productID);
                    const userId = {
                        user: {
                            _id: userID
                        }
                    }
                    if (user) {
                        try {
                            await addSubscriptionForBusinessUser(userId, res, product, 'Stripe')
                        } catch (error) {
                            console.log(error)
                        }
                        const stripelogs = new StripeLogs({
                            transactionID: metadata.transactionID,
                            user: user,
                            paymentStatus: session.payment_status,
                            product: product,
                            transactionDate: new Date(),
                        });
                        await stripelogs.save()
                    }
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({message: "Something went wrong"});
                }
                break;
            // TODO handle other event types
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a 200 res to acknowledge receipt of the event
        res.send();
    }
);

router.post("/stripe/status", auth, async (req, res) => {
    const {transactionID} = req.body;

    const stripeLog = await StripeLogs.find({transactionID: transactionID});
    if(stripeLog.length < 1 || !stripeLog){
        return res.status(404).json({message:'Could not find a payment with this transaction id'})
    }
    if(stripeLog[0].paymentStatus === 'paid' || stripeLog[0].paymentStatus === 'complete'){
        return res.status(200).json({message:'Payment completed successfully'})
    } else {
        return res.status(400).json({message:'Payment canceled'})
    }
})

module.exports = router;
