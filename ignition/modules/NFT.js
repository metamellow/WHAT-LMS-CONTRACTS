const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("NFTModule", (m) => {
  const admin = m.getParameter(
    "initialOwner",
    "0x86c37470D8182Dc62a5A60A3692a60c53874C1bA" // Replace with a default admin address if you have one
  );

  const nft = m.contract("MintNFT", [admin]);
  return { nft };
});
