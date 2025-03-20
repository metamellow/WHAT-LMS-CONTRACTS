const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CoursePaymentVaultModule", (m) => {
  const usdcTokenAddress = m.getParameter(
    "usdcTokenAddress",
    "0xfaFedb041c0DD4fA2Dc0d87a6B0979Ee6FA7af5F" // Replace with a default USDC address if you have one
  );

  const adminWalletAddress = m.getParameter(
    "adminWalletAddress",
    "0xE5fE74913FcD47D6Dc1bD1F48F8920581e683126" // Replace with a default admin address if you have one
  );

  const coursePaymentVault = m.contract("CoursePaymentVault", [usdcTokenAddress, adminWalletAddress]);
  return { coursePaymentVault };
});