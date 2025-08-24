const { RpcProvider, Contract, Account } = require('starknet');
const fs = require('fs');
const path = require('path');

// Load environment variables
const { 
  STARKNET_RPC_URL, 
  CONTRACT_ADDRESS, 
  USDT_CONTRACT_ADDRESS,
  PRIVATE_KEY,
  ACCOUNT_ADDRESS
} = process.env;

// Initialize provider
const provider = new RpcProvider({
  nodeUrl: STARKNET_RPC_URL
});

// Load ABI from file
const abiPath = path.join(__dirname, '..', 'abi', 'propertyRentalMarketplace.json');
let contractAbi;

try {
  const abiData = fs.readFileSync(abiPath, 'utf8');
  contractAbi = JSON.parse(abiData);
} catch (error) {
  console.error('Error loading ABI:', error);
  // Fallback to minimal ABI for now
  contractAbi = [
    {
      "type": "impl",
      "name": "PropertyRentalMarketplaceImpl",
      "interface_name": "marketplace::IPropertyRentalMarketplace"
    },
    {
      "type": "struct",
      "name": "core::integer::u256",
      "members": [
        {
          "name": "low",
          "type": "core::integer::u128"
        },
        {
          "name": "high",
          "type": "core::integer::u128"
        }
      ]
    },
    {
      "type": "enum",
      "name": "core::bool",
      "variants": [
        {
          "name": "False",
          "type": "()"
        },
        {
          "name": "True",
          "type": "()"
        }
      ]
    },
    {
      "type": "interface",
      "name": "marketplace::IPropertyRentalMarketplace",
      "items": [
        {
          "type": "function",
          "name": "list_property",
          "inputs": [
            {
              "name": "rent_per_month",
              "type": "core::integer::u256"
            },
            {
              "name": "description",
              "type": "core::felt252"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "book_property",
          "inputs": [
            {
              "name": "property_id",
              "type": "core::integer::u256"
            },
            {
              "name": "duration_months",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "pay_rent",
          "inputs": [
            {
              "name": "property_id",
              "type": "core::integer::u256"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_property",
          "inputs": [
            {
              "name": "property_id",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "(core::starknet::contract_address::ContractAddress, core::starknet::contract_address::ContractAddress, core::integer::u256, core::bool, core::felt252)"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_property_count",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_usdt_token",
          "inputs": [],
          "outputs": [
            {
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "state_mutability": "view"
        }
      ]
    },
    {
      "type": "constructor",
      "name": "constructor",
      "inputs": [
        {
          "name": "usdt_token",
          "type": "core::starknet::contract_address::ContractAddress"
        }
      ]
    }
  ];
}

// Initialize contract
const contract = new Contract(contractAbi, CONTRACT_ADDRESS, provider);

// Initialize account (if private key is provided)
let account = null;
if (PRIVATE_KEY && ACCOUNT_ADDRESS) {
  account = new Account(provider, ACCOUNT_ADDRESS, PRIVATE_KEY);
}

module.exports = {
  provider,
  contract,
  account,
  CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS
};