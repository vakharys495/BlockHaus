// src/integrations/starknet/starknet.contracts.ts
export const PROPERTY_CONTRACT_ABI = [
  {
    "name": "listProperty",
    "type": "function",
    "inputs": [
      {"name": "owner", "type": "felt"},
      {"name": "details", "type": "felt"},
      {"name": "price", "type": "Uint256"}
    ],
    "outputs": []
  },
  {
    "name": "getProperty",
    "type": "function",
    "inputs": [{"name": "id", "type": "felt"}],
    "outputs": [
      {"name": "owner", "type": "felt"},
      {"name": "details", "type": "felt"},
      {"name": "price", "type": "Uint256"},
      {"name": "isAvailable", "type": "felt"}
    ]
  }
];

export const BOOKING_CONTRACT_ABI = [
  {
    "name": "requestBooking",
    "type": "function",
    "inputs": [
      {"name": "propertyId", "type": "felt"},
      {"name": "tenant", "type": "felt"},
      {"name": "leaseTerm", "type": "felt"}
    ],
    "outputs": []
  }
];

export const PAYMENT_CONTRACT_ABI = [
  {
    "name": "payRent",
    "type": "function",
    "inputs": [
      {"name": "bookingId", "type": "felt"},
      {"name": "amount", "type": "Uint256"}
    ],
    "outputs": []
  }
];