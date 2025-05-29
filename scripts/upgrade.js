const { ethers,upgrades } = require("hardhat");
async function main() {
  const proxyAddress = "0x6f6d49bbcbfbdb41851d9a7754012e56a702a2b1";

  console.log(`>> Upgrading GDPool at ${proxyAddress}...`);

  const GDPoolFactory = await ethers.getContractFactory("CoursePaymentVault");

  const upgraded = await upgrades.upgradeProxy(proxyAddress, GDPoolFactory, {
    unsafeAllow: ["delegatecall"], // nếu contract có dùng delegatecall
  });

  await upgraded.deployed();

  console.log("✅ GDPool upgraded successfully at:", upgraded.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Upgrade failed:", err);
    process.exit(1);
  });
