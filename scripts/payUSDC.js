const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  // Get the signer
  const [signer] = await ethers.getSigners();

  // Get the contract addresses from environment variables
  const VAULT_ADDRESS = "0xDB5910C88dFa26D87768f44aec03103B18AA3Ee0";
  const USDC_ADDRESS = "0xfaFedb041c0DD4fA2Dc0d87a6B0979Ee6FA7af5F";

  // Get the contract instances
  const Vault = await ethers.getContractFactory("CoursePaymentVault");
  const vault = await Vault.attach(VAULT_ADDRESS);

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.attach(USDC_ADDRESS);

  // Amount to pay (in USDC's smallest unit, usually 6 decimals)
  const payAmount = ethers.parseUnits("0.1", 18); // Paying 0.1 USDC (assuming 6 decimals)

  // Course ID (you need to replace this with an actual course ID)
  const courseId = 1; // Replace with the actual course ID
  // Approve the Vault to spend USDC
  console.log("Approving USDC...");
  const approveTx = await usdc.approve(VAULT_ADDRESS, payAmount);
  await approveTx.wait();
  console.log("USDC approved");

  // Deposit USDC into the Vault
  console.log("Paying USDC...");
  const payTx = await vault.pay(courseId, payAmount);
  await payTx.wait();
  console.log("USDC paid successfully");

  // Get the updated balance
  const balance = await vault.balance();
  console.log(`New balance: ${ethers.formatUnits(balance, 18)} USDC`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });