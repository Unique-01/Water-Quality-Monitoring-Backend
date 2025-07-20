const mongoose = require("mongoose");

const PushSubscriptionSchema = new mongoose.Schema({
    subscription: Object,
});

module.exports = mongoose.model("PushSubscription", PushSubscriptionSchema);
