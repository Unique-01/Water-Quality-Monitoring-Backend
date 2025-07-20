const express = require("express");
const router = express.Router();
const PushSubscription = require("../models/PushSubscription");

router.post("/api/subscribe", async (req, res) => {
    const subscription = req.body;
    await PushSubscription.create({ subscription });
    res.status(201).json({ message: "Subscribed successfully" });
});


module.exports = router;