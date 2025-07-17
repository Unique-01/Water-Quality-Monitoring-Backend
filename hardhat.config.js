require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    amoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${process.env.AMOY_API_KEY}`,
      accounts: [process.env.WALLET_PRIVATE_KEY],
      chainId: 80002
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.POLYGON_API_KEY}`,
      accounts: [process.env.WALLET_PRIVATE_KEY],
      chainId: 137
    },
    
  }
};
