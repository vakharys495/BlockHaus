# Blokhaus Backend

This is the backend server for the Blokhaus DApp, which provides API endpoints for interacting with the StarkNet property rental marketplace contract.

## Directory Structure

```
backend/
├── config/              # Configuration files
├── routes/              # Express route handlers
├── services/            # Business logic and StarkNet integration
├── middleware/          # Express middleware
├── abi/                # Contract ABI files
├── .env                 # Environment variables
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with the required environment variables:
   ```bash
   STARKNET_RPC_URL=https://starknet-goerli.infura.io/v3/YOUR_INFURA_KEY
   CONTRACT_ADDRESS=0x011507526d861fdb1b58c2c369b20d398f950b7fbe526b22d005ca8bca0d105a
   USDT_CONTRACT_ADDRESS=0x059320736bbf559a383585483a008068599d01c90f6e4317152b40255e5e4b3
   PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
   ACCOUNT_ADDRESS=YOUR_ACCOUNT_ADDRESS_HERE
   PORT=3001
   NODE_ENV=development
   ```

3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - List a new property

### Bookings
- `POST /api/bookings` - Book a property

### Payments
- `POST /api/payments` - Pay rent for a property
- `GET /api/payments/usdt-address` - Get USDT token address

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

## Contract Integration

The backend integrates with the StarkNet property rental marketplace contract using the starknet.js library. The contract ABI is located in the `abi/` directory.

## Error Handling

All errors are handled by the middleware in `middleware/errorHandler.js`, which provides consistent error responses and logging.