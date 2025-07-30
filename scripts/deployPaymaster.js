// scripts/deployPaymaster.js
// Foodye Paymaster Deployment Script with Hardhat integration

const hre = require("hardhat");
const { ethers } = hre;
require('dotenv').config();

async function deployFoodyePaymaster() {
  console.log('🚀 Starting Foodye Paymaster deployment...\n');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  
  // Configuration
  const config = {
    foodyeTokenAddress: process.env.NEXT_PUBLIC_FOODYE_TOKEN_ADDRESS,
    entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // Standard EntryPoint
    ownerAddress: process.env.PAYMASTER_OWNER_ADDRESS || deployer.address,
    initialDeposit: ethers.parseEther('0.1'), // 0.1 ETH initial deposit
    exchangeRate: 25000000, // 1 ETH = 25M FOODYE (based on 1 FOODYE = 0.0001 USDC)
  };

  // Validate configuration
  if (!config.foodyeTokenAddress) {
    throw new Error('NEXT_PUBLIC_FOODYE_TOKEN_ADDRESS not set in environment');
  }

  console.log('📋 Deployment Configuration:');
  console.log(`   Network: ${hre.network.name}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Owner: ${config.ownerAddress}`);
  console.log(`   Foodye Token: ${config.foodyeTokenAddress}`);
  console.log(`   EntryPoint: ${config.entryPointAddress}`);
  console.log(`   Initial Deposit: ${ethers.formatEther(config.initialDeposit)} ETH`);
  console.log(`   Exchange Rate: 1 ETH = ${config.exchangeRate.toLocaleString()} FOODYE\n`);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther('0.05')) {
    throw new Error('Insufficient ETH balance for deployment (need at least 0.05 ETH)');
  }

  console.log('📦 Deploying Foodye Paymaster contract...');

  try {
    // Get contract factory
    const FoodyePaymaster = await ethers.getContractFactory('FoodyePaymaster');

    // Deploy contract
    console.log('   Sending deployment transaction...');
    const paymaster = await FoodyePaymaster.deploy(
      config.entryPointAddress,
      config.foodyeTokenAddress,
      config.ownerAddress,
      {
        gasLimit: 3000000,
      }
    );

    console.log(`⏳ Transaction sent: ${paymaster.deploymentTransaction().hash}`);
    console.log('   Waiting for confirmation...');

    // Wait for deployment
    await paymaster.waitForDeployment();
    const contractAddress = await paymaster.getAddress();

    console.log(`✅ Foodye Paymaster deployed successfully!`);
    console.log(`   Contract Address: ${contractAddress}\n`);

    // Initial setup
    console.log('🔧 Setting up initial configuration...');

    // Set exchange rate (1 ETH = 10M FOODYE, so 1 FOODYE = 0.0001 USDC equivalent)
    console.log(`   Setting exchange rate: 1 ETH = ${config.exchangeRate.toLocaleString()} FOODYE...`);
    const setRateTx = await paymaster.updateExchangeRate(config.exchangeRate);
    await setRateTx.wait();
    console.log(`   ✅ Exchange rate set: ${setRateTx.hash}`);

    // Deposit initial ETH for gas sponsorship
    console.log(`   Depositing ${ethers.formatEther(config.initialDeposit)} ETH for gas sponsorship...`);
    const depositTx = await paymaster.deposit({ value: config.initialDeposit });
    await depositTx.wait();
    console.log(`   ✅ Deposit completed: ${depositTx.hash}`);

    // Verify deposit
    const deposit = await paymaster.getDeposit();
    console.log(`   💰 Paymaster deposit: ${ethers.formatEther(deposit)} ETH`);

    // Test the exchange rate calculation
    const testGasCost = ethers.parseEther('0.001'); // 1 milli ETH
    const requiredFoodye = await paymaster.getRequiredFoodyeAmount(testGasCost);
    console.log(`   📊 Test: 0.001 ETH gas = ${requiredFoodye} FOODYE tokens`);

    // Environment variables to add
    console.log('\n🌍 Environment Variables:');
    console.log('Add these to your .env.local file:');
    console.log(`NEXT_PUBLIC_FOODYE_PAYMASTER_ADDRESS=${contractAddress}`);
    console.log(`PAYMASTER_OWNER_ADDRESS=${config.ownerAddress}`);

    // Integration guide
    console.log('\n🎯 Integration Guide:');
    console.log('1. Add the environment variables above to your .env.local');
    console.log('2. Users will need to approve Foodye tokens to the Paymaster:');
    console.log(`   - Paymaster Address: ${contractAddress}`);
    console.log(`   - Approve amount: Sufficient FOODYE for gas fees`);
    console.log('3. Each 0.001 ETH of gas costs ~${requiredFoodye} FOODYE');
    console.log('4. Monitor Paymaster balance and top up as needed');
    
    // Contract verification info
    console.log('\n🔍 Contract Verification:');
    console.log('To verify on Basescan, run:');
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${config.entryPointAddress}" "${config.foodyeTokenAddress}" "${config.ownerAddress}"`);

    return {
      contractAddress,
      deploymentHash: paymaster.deploymentTransaction().hash,
      ownerAddress: config.ownerAddress,
      deposit: ethers.formatEther(deposit),
      exchangeRate: config.exchangeRate,
      testGasCost: ethers.formatEther(testGasCost),
      requiredFoodye: requiredFoodye.toString(),
    };

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

// Execute deployment
if (require.main === module) {
  deployFoodyePaymaster()
    .then((result) => {
      console.log('\n🎉 Deployment completed successfully!');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Deployment failed:');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deployFoodyePaymaster };
