const fs = require('fs');
const path = require('path');
const { getListingById } = require('./listingStore');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'bookings.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ bookings: [], lastId: 0 }, null, 2));
  }
}

function readDb() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function addBooking({
  propertyId,
  renterName,
  renterEmail,
  renterPhone,
  renterWalletAddress,
  moveInDate,
  message,
}) {
  const db = readDb();
  const nextId = (db.lastId || 0) + 1;

  // Load property info from listing store
  const listing = getListingById(propertyId);
  if (!listing) {
    const err = new Error('Property (listing) not found');
    err.statusCode = 404;
    throw err;
  }

  // Parse rent amount from listing.price (expects "123 USDT/month")
  const rent = parseInt(String(listing.price).replace(/[^\d]/g, '')) || 0;

  const booking = {
    id: nextId,
    propertyId,
    propertyTitle: listing.title,
    propertyLocation: listing.location,
    propertyImage: listing.image,
    ownerWalletAddress: listing.walletAddress || '',
    renterName,
    renterEmail,
    renterPhone,
    renterWalletAddress: renterWalletAddress || '',
    requestDate: new Date().toISOString(),
    moveInDate,
    status: 'pending', // 'pending' | 'approved' | 'rejected' | 'paid' | 'completed'
    message: message || '',
    rentAmount: `${rent} USDT`,
    totalAmount: `${rent} USDT`,
    approvalDate: null,
    paymentDeadline: null,
  };

  db.bookings.push(booking);
  db.lastId = nextId;
  writeDb(db);
  return booking;
}

function listBookings({ ownerWalletAddress, renterWalletAddress } = {}) {
  const db = readDb();
  let items = db.bookings;
  if (ownerWalletAddress) {
    items = items.filter(b => (b.ownerWalletAddress || '').toLowerCase() === String(ownerWalletAddress).toLowerCase());
  }
  if (renterWalletAddress) {
    items = items.filter(b => (b.renterWalletAddress || '').toLowerCase() === String(renterWalletAddress).toLowerCase());
  }
  // newest first
  return items.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
}

function getBookingById(id) {
  const db = readDb();
  return db.bookings.find(b => b.id === Number(id));
}

function updateBooking(id, updates) {
  const db = readDb();
  const idx = db.bookings.findIndex(b => b.id === Number(id));
  if (idx === -1) return null;
  db.bookings[idx] = { ...db.bookings[idx], ...updates };
  writeDb(db);
  return db.bookings[idx];
}

module.exports = {
  addBooking,
  listBookings,
  getBookingById,
  updateBooking,
};
