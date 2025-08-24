const express = require('express');
const router = express.Router();
const starknetService = require('../services/starknetService');

// Get all properties
router.get('/', async (req, res, next) => {
  try {
    const properties = await starknetService.getAllProperties();
    res.json(properties);
  } catch (error) {
    next(error);
  }
});

// Get property by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await starknetService.getPropertyById(id);
    res.json(property);
  } catch (error) {
    next(error);
  }
});

// List a new property
router.post('/', async (req, res, next) => {
  try {
    const { rentPerMonth, description } = req.body;
    
    if (!rentPerMonth || !description) {
      return res.status(400).json({ error: 'rentPerMonth and description are required' });
    }
    
    const result = await starknetService.listProperty(rentPerMonth, description);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;