const { Contract } = require('starknet');
const { provider, USDT_CONTRACT_ADDRESS } = require('../config/starknet');

// Minimal Cairo 2 ERC20 ABI subset for balance_of
const ERC20_ABI = [
  {
    type: 'struct',
    name: 'core::integer::u256',
    members: [
      { name: 'low', type: 'core::integer::u128' },
      { name: 'high', type: 'core::integer::u128' },
    ],
  },
  {
    type: 'interface',
    name: 'IERC20',
    items: [
      {
        type: 'function',
        name: 'balance_of',
        inputs: [
          { name: 'account', type: 'core::starknet::contract_address::ContractAddress' },
        ],
        outputs: [
          { type: 'core::integer::u256' },
        ],
        state_mutability: 'view',
      },
    ],
  },
];

function toNumberFromU256(u256) {
  try {
    const low = typeof u256.low === 'bigint' ? u256.low : BigInt(u256.low);
    const high = typeof u256.high === 'bigint' ? u256.high : BigInt(u256.high);
    return Number(high * (BigInt(2) ** BigInt(128)) + low);
  } catch {
    return 0;
  }
}

async function getUsdtBalance(address) {
  if (!USDT_CONTRACT_ADDRESS) return 0;
  try {
    const erc20 = new Contract(ERC20_ABI, USDT_CONTRACT_ADDRESS, provider);
    const res = await erc20.balance_of(address);
    const balance = toNumberFromU256(res);
    return balance;
  } catch (e) {
    console.error('Error reading USDT balance:', e);
    return 0;
  }
}

module.exports = {
  getUsdtBalance,
};
