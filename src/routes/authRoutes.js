const express = require('express');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const config = require('../config/config');
const router = express.Router();

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

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === config.adminUsername && password === config.adminPassword) {
    const token = jwt.sign({ username }, config.jwtSecret, { expiresIn: '1h' });
    res.json({ token });
    logger.info(`User ${username} logged in`);
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
    logger.warn(`Failed login attempt for ${username}`);
  }
});

module.exports = router;