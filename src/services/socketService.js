const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});

module.exports = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Frontend connected: ${socket.id}`);

    // Handle client joining specific sensor rooms
    socket.on('joinSensor', (sensorId) => {
      socket.join(sensorId);
      logger.info(`Socket ${socket.id} joined room ${sensorId}`);
    });

    // Optional: leave sensor room if needed
    socket.on('leaveSensor', (sensorId) => {
      socket.leave(sensorId);
      logger.info(`Socket ${socket.id} left room ${sensorId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Frontend disconnected: ${socket.id}`);
    });
  });
};
