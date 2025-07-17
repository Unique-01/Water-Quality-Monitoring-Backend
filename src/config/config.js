require('dotenv').config();

module.exports = {
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/water_quality',
  mqttBroker: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
  mqttUsername: process.env.MQTT_USERNAME || '',
  mqttPassword: process.env.MQTT_PASSWORD || '',
  deviceApiKey: process.env.DEVICE_API_KEY ,
  jwtSecret: process.env.JWT_SECRET ,
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD ,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  port: process.env.PORT || 3000,
  
};