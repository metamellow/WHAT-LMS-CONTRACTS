const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deployedAddressesPath = path.join(__dirname, "../deployed_addresses.json");
  const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));
  const proxyAddress = deployedAddresses.CoursePaymentVault; 

  const CoursePaymentVaultV2 = await ethers.getContractFactory("CoursePaymentVaultV2");

  const upgraded = await upgrades.upgradeProxy(proxyAddress, CoursePaymentVaultV2);
  await upgraded.deployed();

  console.log("CoursePaymentVault upgraded at:", upgraded.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 