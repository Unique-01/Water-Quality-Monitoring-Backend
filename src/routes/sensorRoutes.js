const express = require('express');
const router = express.Router();
const Joi = require('joi');
const authenticateToken = require('../middleware/authenticateToken');
const SensorData = require('../models/SensorData');
const Threshold = require('../models/Threshold');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});

router.get('/:sensorId/data', authenticateToken, async (req, res) => {
  try {
    const { sensorId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const data = await SensorData.find({ sensorId }).sort({ timestamp: -1 }).limit(limit);
    res.json(data);
    logger.info('Sensor data retrieved', { sensorId, count: data.length });
  } catch (error) {
    logger.error('Error retrieving sensor data', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:sensorId/thresholds', authenticateToken, async (req, res) => {
  const schema = Joi.object({
    pHMin: Joi.number().required(),
    pHMax: Joi.number().required(),
    tempMin: Joi.number().required(),
    tempMax: Joi.number().required(),
    turbidityMax: Joi.number().required(),
    salinityMax: Joi.number().required(),
    waterLevelMin: Joi.number().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { sensorId } = req.params;
    const thresholdData = {
      sensorId,
      ...req.body
    };

    await Threshold.findOneAndUpdate(
      { sensorId },
      thresholdData,
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ message: 'Thresholds updated successfully' });
    logger.info('Thresholds updated', { sensorId });
  } catch (err) {
    logger.error('Error updating thresholds', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:sensorId/thresholds', authenticateToken, async (req, res) => {
  try {
    const { sensorId } = req.params;
    const thresholds = await Threshold.findOne({ sensorId });
    if (!thresholds) return res.status(404).json({ error: 'No thresholds found' });
    res.json(thresholds);
  } catch (error) {
    logger.error('Error retrieving thresholds', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;