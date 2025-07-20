const mqtt = require("mqtt");
const winston = require("winston");
const SensorData = require("../models/SensorData");
const Threshold = require("../models/Threshold");
const BlockchainService = require("./blockchainService");
const PushSubscription = require("../models/PushSubscription");
const webpush = require("web-push");

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

async function connectMqtt(io) {
    const client = mqtt.connect(process.env.MQTT_BROKER, {
        username: process.env.MQTT_USERNAME || "",
        password: process.env.MQTT_PASSWORD || "",
    });

    const blockchainService = new BlockchainService();

    client.on("connect", () => {
        logger.info("Connected to MQTT broker");
        client.subscribe("sensors/water_quality/#", (err) => {
            if (err) logger.error("Subscription error", { error: err.message });
        });
    });

    client.on("message", async (topic, message) => {
        try {
            // const data = JSON.parse(message.toString());
            const { timestamp, ...data } = JSON.parse(message.toString()); // strip invalid timestamp
            if (data.apiKey !== process.env.DEVICE_API_KEY) {
                logger.warn("Invalid API key");
                return;
            }

            const {
                sensorId,
                pH,
                temperature,
                turbidity,
                salinity,
                waterLevel,
            } = data;

            const sensorData = {
                sensorId,
                pH: pH != null ? parseFloat(pH) : undefined,
                temperature:
                    temperature != null ? parseFloat(temperature) : undefined,
                turbidity:
                    turbidity != null ? parseFloat(turbidity) : undefined,
                salinity: salinity != null ? parseFloat(salinity) : undefined,
                waterLevel:
                    waterLevel != null ? parseFloat(waterLevel) : undefined,
            };

            const txHash = await blockchainService.submitWaterQuality(
                sensorId,
                sensorData.pH || 0,
                sensorData.temperature || 0,
                sensorData.turbidity || 0,
                sensorData.salinity || 0,
                sensorData.waterLevel || 0
            );
            sensorData.blockchainHash = txHash;

            const thresholds = await Threshold.findOne({ sensorId });
            const alerts = [];
            if (thresholds) {
                if (
                    sensorData.pH < thresholds.pHMin ||
                    sensorData.pH > thresholds.pHMax
                ) {
                    alerts.push(`pH out of range: ${sensorData.pH}`);
                }
                if (
                    sensorData.temperature < thresholds.tempMin ||
                    sensorData.temperature > thresholds.tempMax
                ) {
                    alerts.push(
                        `Temperature out of range: ${sensorData.temperature}`
                    );
                }
                if (sensorData.turbidity > thresholds.turbidityMax) {
                    alerts.push(`Turbidity too high: ${sensorData.turbidity}`);
                }
                if (sensorData.salinity > thresholds.salinityMax) {
                    alerts.push(`Salinity too high: ${sensorData.salinity}`);
                }
                if (sensorData.waterLevel < thresholds.waterLevelMin) {
                    alerts.push(
                        `Water Level too low: ${sensorData.waterLevel}`
                    );
                }

                if (alerts.length > 0) {
                    io.emit("alert", {
                        sensorId,
                        alerts,
                        timestamp: new Date().toISOString(),
                    });

                    const notificationPayload = {
                        title: "Water Quality Alert",
                        body: alerts.join("\n"),
                        // icon: "/alert-icon.png", // Make sure this icon path is accessible by the browser
                        timestamp: Date.now(),
                    };

                    try {
                        // Fetch all stored push subscriptions
                        const subscriptions = await PushSubscription.find({});

                        for (const { subscription } of subscriptions) {
                          logger.info("Attempting to send push", { endpoint: subscription.endpoint });
                          try {
                            await webpush.sendNotification(
                              subscription,
                              JSON.stringify(notificationPayload)
                            );
                            logger.info("Push notification sent");
                          } catch (err) {
                            logger.error("Push Notification Error", {
                              error: err.message,
                              endpoint: subscription.endpoint,
                            });
                          }
                        }
                    } catch (dbErr) {
                        logger.error("Error fetching push subscriptions", {
                            error: dbErr.message,
                        });
                    }
                    

                    logger.warn("Threshold alert triggered", {
                        sensorId,
                        alerts,
                    });
                }
            }

            const newSensorRecord = await SensorData.create(sensorData);
            io.emit("sensorData", newSensorRecord);
            io.to(sensorId).emit("sensorData", newSensorRecord); // Emit to clients joined to specific room
            logger.info("Sensor data stored and emitted", { sensorId });
        } catch (error) {
            logger.error("Error processing MQTT message", {
                error: error.message,
                stack: error.stack,
            });
        }
    });

    client.on("error", (err) => {
        logger.error("MQTT connection error", { error: err.message });
    });
}

module.exports = connectMqtt;
