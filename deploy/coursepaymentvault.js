const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const usdcAddress = "0xfaFedb041c0DD4fA2Dc0d87a6B0979Ee6FA7af5F"; 

  console.log("Deploying CoursePaymentVault (proxy) with account:", deployer.address);

    const CoursePaymentVault = await ethers.getContractFactory("CoursePaymentVault", deployer);
  const vault = await upgrades.deployProxy(CoursePaymentVault, [usdcAddress], {
    initializer: "initialize",
  });
  await vault.deployed();
  console.log(`>> Deployed at ${vault.address}`);

  const filePath = path.join(__dirname, "../deployed_addresses.json");
  let deployedAddresses = {};
  if (fs.existsSync(filePath)) {
    deployedAddresses = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  deployedAddresses.CoursePaymentVault = vault.address;
  fs.writeFileSync(filePath, JSON.stringify(deployedAddresses, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});