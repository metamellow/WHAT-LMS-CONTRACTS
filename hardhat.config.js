require("@nomicfoundation/hardhat-toolbox");
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
};
