const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { addListing, getAllListings, getListingById } = require('../services/listingStore');

const router = express.Router();

function toAbsoluteUrl(p, req) {
  if (!p) return p;
  if (p.startsWith('http')) return p;
  const base = `${req.protocol}://${req.get('host')}`;
  return `${base}${p}`;
}

function absolutizeListing(item, req) {
  if (!item) return item;
  return {
    ...item,
    image: toAbsoluteUrl(item.image, req),
    images: Array.isArray(item.images) ? item.images.map((u) => toAbsoluteUrl(u, req)) : item.images,
  };
}

// Ensure uploads directory exists
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

// Configure multer storage per listing
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Put all images in root uploads for simplicity
    cb(null, UPLOAD_ROOT);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    cb(null, `${base}_${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image uploads are allowed'));
  }
});

// Create a new listing with images
// Note: For Vite-based dev servers, ensure proxy/cors allows form-data
router.post('/', upload.array('images', 10), (req, res, next) => {
  try {
    const { title, description, price, location, beds, baths, area, propertyType, city, rentalDuration, walletAddress } = req.body;

    if (!title || !price || !location) {
      return res.status(400).json({ error: 'title, price, and location are required' });
    }

    // Normalize price string (ensure includes currency unit for UI sorting/filters)
    const normalizedPrice = /USDT/.test(String(price)) ? String(price) : `${price} USDT/month`;

    const imageFiles = (req.files || []).map(f => `/uploads/${path.basename(f.path)}`);

    const created = addListing({
      title,
      description: description || '',
      price: normalizedPrice,
      location: location || '',
      beds: Number(beds) || 0,
      baths: Number(baths) || 0,
      area: area || '',
      propertyType: propertyType || '',
      city: city || '',
      rentalDuration: rentalDuration || 'monthly',
      image: imageFiles[0] || '',
      images: imageFiles,
      walletAddress: walletAddress || '',
      badge: 'Active',
      type: 'rent',
    });

    res.status(201).json(absolutizeListing(created, req));
  } catch (err) {
    next(err);
  }
});

// Get all listings
router.get('/', (req, res, next) => {
  try {
    const items = getAllListings().map((i) => absolutizeListing(i, req));
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Get a single listing
router.get('/:id', (req, res, next) => {
  try {
    const item = getListingById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Listing not found' });
    res.json(absolutizeListing(item, req));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
