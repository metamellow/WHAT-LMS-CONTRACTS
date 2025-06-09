const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deployedAddressesPath = path.join(__dirname, "../deployed_addresses.json");
  const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));
  const proxyAddress = deployedAddresses.CoursePaymentVault; 
  console.log(proxyAddress);

  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("Implementation address:", implAddress);

  // const CoursePaymentVault = await ethers.getContractFactory("CoursePaymentVault");

  // const upgraded = await upgrades.upgradeProxy(proxyAddress, CoursePaymentVault);
  // await upgraded.deployed();

  // console.log("CoursePaymentVault upgraded at:", upgraded.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 