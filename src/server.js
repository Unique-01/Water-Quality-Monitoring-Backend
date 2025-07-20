const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config/config");
const sensorRoutes = require("./routes/sensorRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");
const mqttService = require("./services/mqttService");
const socketService = require("./services/socketService");
const connectDb = require("./db");
const webpush = require("web-push");
const pushNotificationRoutes = require("./routes/pushNotificationRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: config.corsOrigin },
});

webpush.setVapidDetails(
    `mailto:${process.env.EMAIL || "your-email@example.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

app.use("/api/sensors", sensorRoutes);
app.use("/api/auth", authRoutes);
app.use("", pushNotificationRoutes);
app.use(errorHandler);

// mongoose
//     .connect(config.mongodbUri, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     })
//     .then(() => console.log("Connected to MongoDB Yes"))
//     .catch((err) => console.error("MongoDB connection error:", err));
connectDb();
mqttService(io);
socketService(io);

server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});
