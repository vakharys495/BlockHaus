const { Provider, Account, ec, hash, CallData } = require('starknet');

async function computeAndDeployAccount() {
  const provider = new Provider({
    rpc: { nodeUrl: 'https://starknet-sepolia.infura.io/v3/52282e244cdd406e8f7c437dc067b028' },
  });

  // Use provided private key
  const privateKey = '0x051d90abd643aa9d689fd03dc136e74188f4907fdf1ed3de082a48c838250bfd';
  const publicKey = ec.starkCurve.getStarkKey(privateKey);

  // OpenZeppelin Account class hash (Cairo v2, Sepolia testnet)
  const accountClassHash = '0x01e60c8722677cfb7dd8dbea5be86c09265db02cdfe77113e77da7d44c017388';

  // Compute account address
  const constructorCalldata = CallData.compile([publicKey]);
  const accountAddress = hash.calculateContractAddressFromHash(
    publicKey, // salt
    accountClassHash,
    constructorCalldata,
    0 // deployer address
  );

  console.log('Computed account address:', accountAddress);

  // Check if account is already deployed
  try {
    const nonce = await provider.getNonceForAddress(accountAddress, 'pending');
    console.log('Account already deployed with nonce:', nonce);
    return accountAddress;
  } catch (error) {
    console.log('Account not deployed, proceeding to fund and deploy.');
  }

  // Verify funding
  console.log('Please ensure the account address is funded with at least 0.01 ETH:');
  console.log('Address:', accountAddress);
  console.log('Check balance on Voyager: https://sepolia.voyager.online/contract/' + accountAddress);
  console.log('Use a faucet like https://faucet.starknet.io/ if needed.');
  console.log('Waiting for funding confirmation (manual step). Press Enter after funding...');
  await new Promise(resolve => process.stdin.once('data', resolve));

  // Deploy account
  try {
    const account = new Account(provider, accountAddress, privateKey);
    const deployTx = await account.deployAccount({
      classHash: accountClassHash,
      constructorCalldata: constructorCalldata,
      addressSalt: publicKey,
    });
    console.log('Deployment transaction hash:', deployTx.transaction_hash);
    console.log('Deployed account address:', deployTx.contract_address);
    await provider.waitForTransaction(deployTx.transaction_hash);
    return deployTx.contract_address;
  } catch (error) {
    console.error('Account deployment failed:', error);
    throw error;
  }
}

computeAndDeployAccount()
  .then(address => {
    console.log('Account deployment successful. Update .env with:');
    console.log(`STARKNET_ACCOUNT_ADDRESS=${address}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Deployment script failed:', error);
    process.exit(1);
  });