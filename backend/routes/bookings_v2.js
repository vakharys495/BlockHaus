const express = require('express');
const { addBooking, listBookings, updateBooking, getBookingById } = require('../services/bookingStore');

const router = express.Router();
const { getUsdtBalance } = require('../services/tokenService');

// Create booking
router.post('/', (req, res, next) => {
  try {
    const { propertyId, renterName, renterEmail, renterPhone, renterWalletAddress, moveInDate, message } = req.body;
    if (!propertyId || !renterName || !renterEmail || !renterPhone || !moveInDate) {
      return res.status(400).json({ error: 'propertyId, renterName, renterEmail, renterPhone, moveInDate are required' });
    }
    const created = addBooking({ propertyId: Number(propertyId), renterName, renterEmail, renterPhone, renterWalletAddress, moveInDate, message });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// List bookings (filter by owner or renter)
router.get('/', (req, res, next) => {
  try {
    const { ownerWalletAddress, renterWalletAddress } = req.query;
    const items = listBookings({ ownerWalletAddress, renterWalletAddress });
    res.json(items);
  } catch (err) { next(err); }
});

// Approve/Reject booking by owner
router.post('/:id/approve', (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // boolean
    const booking = getBookingById(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const status = approved ? 'approved' : 'rejected';
    const updates = {
      status,
      approvalDate: new Date().toISOString(),
      paymentDeadline: approved ? new Date(Date.now() + 7*24*60*60*1000).toISOString() : null,
      message: approved ? 'Your booking has been approved.' : 'Your booking was rejected.'
    };
    const updated = updateBooking(id, updates);
    res.json(updated);
  } catch (err) { next(err); }
});

// Mark booking paid (after on-chain or mock validation)
router.post('/:id/pay', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payerWalletAddress } = req.body; // owner or renter wallet address
    const booking = getBookingById(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'approved') return res.status(400).json({ error: 'Booking not approved' });

    const amount = parseInt(String(booking.totalAmount).replace(/[^\d]/g, '')) || 0;

    // Check on-chain balance for payer address
    if (!payerWalletAddress) return res.status(400).json({ error: 'payerWalletAddress is required' });
    const balance = await getUsdtBalance(payerWalletAddress);
    if (Number(balance) < amount) {
      return res.status(400).json({ error: 'Insufficient balance to pay for this property' });
    }

    const updated = updateBooking(id, { status: 'paid', message: 'Payment successful' });
    res.json(updated);
  } catch (err) { next(err); }
});

module.exports = router;
