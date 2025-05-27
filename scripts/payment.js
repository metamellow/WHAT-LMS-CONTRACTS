
const { ethers, upgrades } = require("hardhat");

async function main() {
  const usdcAddress = "0xfaFedb041c0DD4fA2Dc0d87a6B0979Ee6FA7af5F";

  const PaymentVault = (await ethers.getContractFactory("CoursePaymentVault", (await ethers.getSigners())[0]));
    const vault = (await upgrades.deployProxy(PaymentVault, [usdcAddress], {
      unsafeAllow: ["delegatecall"],
    }));
    await vault.deployed();
    console.log(`>> Deployed at ${vault.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});