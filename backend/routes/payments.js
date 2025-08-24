const express = require('express');
const router = express.Router();
const starknetService = require('../services/starknetService');

// Pay rent for a property
router.post('/', async (req, res, next) => {
  try {
    const { propertyId, amount } = req.body;
    
    if (!propertyId || !amount) {
      return res.status(400).json({ error: 'propertyId and amount are required' });
    }
    
    const result = await starknetService.payRent(propertyId, amount);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Get USDT token address
router.get('/usdt-address', async (req, res, next) => {
  try {
    const address = await starknetService.getUsdtTokenAddress();
    res.json({ address });
  } catch (error) {
    next(error);
  }
});

module.exports = router;