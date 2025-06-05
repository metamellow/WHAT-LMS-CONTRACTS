const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MintNFT with account:", deployer.address);

  const MintNFT = await ethers.getContractFactory("MintNFT");
  const nft = await MintNFT.deploy();
  await nft.deployed();

  console.log("MintNFT deployed to:", nft.address);

  const deployedAddresses = { MintNFT: nft.address };
  fs.writeFileSync(
    path.join(__dirname, "../deployed_addresses.json"),
    JSON.stringify(deployedAddresses, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 