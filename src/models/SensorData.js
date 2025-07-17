const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema(
    {
        sensorId: { type: String, required: true, index: true },
        pH: { type: Number },
        temperature: { type: Number },
        turbidity: { type: Number },
        salinity: { type: Number },
        waterLevel: { type: Number },
        blockchainHash: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SensorData", sensorSchema);
