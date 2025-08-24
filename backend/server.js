require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const propertyRoutes = require('./routes/properties');
const bookingRoutes = require('./routes/bookings');
const bookingRoutesV2 = require('./routes/bookings_v2');
const paymentRoutes = require('./routes/payments');
const listingsRoutes = require('./routes/listings');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/bookings_v2', bookingRoutesV2);
app.use('/api/payments', paymentRoutes);
app.use('/api/listings', listingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Blokhaus backend is running',
    timestamp: new Date().toISOString()
  });
});

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Blokhaus backend server running on port ${PORT}`);
});

module.exports = app;