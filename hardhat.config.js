require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@typechain/hardhat");
require("hardhat-gas-reporter");
require("solidity-coverage");


require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    fantomTestnet: {
      url: "https://rpc.testnet.fantom.network/",
      chainId: 4002,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
   typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
};
