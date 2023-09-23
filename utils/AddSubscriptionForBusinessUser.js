const {User} = require("../models/User");
const {UserType} = require("../models/UserType");
const {SubscriptionPlans} = require("../models/SubscriptionPlans");
const addMonth = require("./AddMonth");
const OneMonthPrice = 1.99;
const ThreeMonthPrice = 4.99;

async function addSubscriptionForBusinessUser(req, res, product, paymentUsed) {
    const user = await User.findById(req.user._id);
    const userType = await UserType.findById(user.userType);
    if (userType) {
        userType.isVerified = "3";
        await userType.save();
    }
    const subscriptionPlan = await SubscriptionPlans.findById(user.subscriptionPlan);
    let subscription;
    if (product.price === OneMonthPrice) {
        if (!subscriptionPlan) {
            subscription = new SubscriptionPlans({
                startingDate: new Date(),
                endDate: addMonth(new Date(), 1),
                subscriptionPlan: "One Month Subscription",
                amountPayed: OneMonthPrice,
                paymentUsed: paymentUsed
            });
            await subscription.save()
        } else {
            if (subscriptionPlan.endDate >= new Date()) {
                const newEndDate = addMonth(subscriptionPlan.endDate, 1); // Calculate the new end date
                subscriptionPlan.startingDate = subscriptionPlan.endDate; // Set startingDate to the previous endDate
                subscriptionPlan.endDate = newEndDate;// Update endDate with the new value
                subscriptionPlan.paymentUsed = paymentUsed
                subscriptionPlan.save();
            } else {
                subscriptionPlan.startingDate = new Date();
                subscriptionPlan.endDate = addMonth(new Date(), 1);
                subscriptionPlan.paymentUsed = paymentUsed
                subscriptionPlan.save();
            }
        }
    } else {
        if (!subscriptionPlan) {
            subscription = new SubscriptionPlans({
                startingDate: new Date(),
                endDate: addMonth(new Date(), 3),
                subscriptionPlan: "Three Month Subscription",
                amountPayed: ThreeMonthPrice,
                paymentUsed: paymentUsed
            });
            await subscription.save()
        } else {
            if (subscriptionPlan.endDate >= new Date()) {
                const newEndDate = addMonth(subscriptionPlan.endDate, 3); // Calculate the new end date
                subscriptionPlan.startingDate = subscriptionPlan.endDate; // Set startingDate to the previous endDate
                subscriptionPlan.endDate = newEndDate; // Update endDate with the new value
                subscriptionPlan.paymentUsed = paymentUsed
                subscriptionPlan.save();
            } else {
                subscriptionPlan.startingDate = new Date();
                subscriptionPlan.endDate = addMonth(new Date(), 3);
                subscriptionPlan.paymentUsed = paymentUsed
                subscriptionPlan.save();
            }
        }
    }
}

exports.addSubscriptionForBusinessUser = addSubscriptionForBusinessUser;
