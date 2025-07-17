const mongoose = require("mongoose");
const winston = require("winston");

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "logs/combined.log" }),
        new winston.transports.Console(),
    ],
});

async function connectDb() {
    try {
        await mongoose.connect(
            `${process.env.MONGODB_URI}/water_quality` ||
                "mongodb://localhost:27017/water_quality"
        );
        logger.info("Connected to MongoDB via Mongoose");
    } catch (error) {
        logger.error("Mongoose connection error", { error: error.message });
        process.exit(1);
    }
}

module.exports = connectDb;
