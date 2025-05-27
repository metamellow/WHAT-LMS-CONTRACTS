const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CoursePaymentVaultModule", (m) => {
  const usdcTokenAddress = m.getParameter(
    "usdcTokenAddress",
    "0xfaFedb041c0DD4fA2Dc0d87a6B0979Ee6FA7af5F" // Replace with a default USDC address if you have one
  );

  const coursePaymentVault = m.contract("CoursePaymentVault", [usdcTokenAddress]);
  return { coursePaymentVault };
});