const mongoose = require("mongoose");

const thresholdSchema = new mongoose.Schema(
    {
        sensorId: { type: String, required: true, unique: true },
        pHMin: { type: Number, required: true },
        pHMax: { type: Number, required: true },
        tempMin: { type: Number, required: true },
        tempMax: { type: Number, required: true },
        turbidityMax: { type: Number, required: true },
        salinityMax: { type: Number, required: true },
        waterLevelMin: { type: Number, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Threshold", thresholdSchema);
