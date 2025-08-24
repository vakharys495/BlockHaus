const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'listings.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ listings: [], lastId: 0 }, null, 2));
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

function getAllListings() {
  const db = readDb();
  return db.listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getListingById(id) {
  const db = readDb();
  return db.listings.find(l => l.id === Number(id));
}

function addListing(listing) {
  const db = readDb();
  const nextId = (db.lastId || 0) + 1;
  const toSave = {
    id: nextId,
    createdAt: new Date().toISOString(),
    ...listing,
  };
  db.listings.push(toSave);
  db.lastId = nextId;
  writeDb(db);
  return toSave;
}

module.exports = {
  getAllListings,
  getListingById,
  addListing,
};
