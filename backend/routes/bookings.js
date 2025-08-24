const express = require('express');
const router = express.Router();
const starknetService = require('../services/starknetService');

// Book a property
router.post('/', async (req, res, next) => {
  try {
    const { propertyId, durationMonths } = req.body;
    
    if (!propertyId || !durationMonths) {
      return res.status(400).json({ error: 'propertyId and durationMonths are required' });
    }
    
    const result = await starknetService.bookProperty(propertyId, durationMonths);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;