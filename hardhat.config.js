require("dotenv").config({ path: ".env" });

require("@nomicfoundation/hardhat-toolbox");
require("@fireblocks/hardhat-fireblocks");
//const { ApiBaseUrl } = require("@fireblocks/fireblocks-web3-provider");

const fs = require("fs");
const path = require("path");
const fb_apiSecret = fs.readFileSync(
  path.resolve("fireblocks_secret_SIGNER.key"),
  "utf8"
);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    holesky: {
      url: "https://rpc.ankr.com/eth_holesky",
      fireblocks: {
        //apiBaseUrl: process.env.FIREBLOCKS_URL,
        privateKey: fb_apiSecret,
        apiKey: process.env.FIREBLOCKS_API_KEY_SIGNER,
        vaultAccountIds: process.env.FIREBLOCKS_VAULT_ACCOUNT_ID_DEPLOYER,
      },
    },
    mumbai: {
      url: "https://rpc.ankr.com/polygon_mumbai",
      fireblocks: {
        //apiBaseUrl: process.env.FIREBLOCKS_URL,
        privateKey: fb_apiSecret,
        apiKey: process.env.FIREBLOCKS_API_KEY_SIGNER,
        vaultAccountIds: process.env.FIREBLOCKS_VAULT_ACCOUNT_ID_DEPLOYER,
      },
    },
    amoy: {
      url: "https://rpc.ankr.com/polygon_amoy",
      fireblocks: {
        //apiBaseUrl: process.env.FIREBLOCKS_URL,
        privateKey: fb_apiSecret,
        apiKey: process.env.FIREBLOCKS_API_KEY_SIGNER,
        vaultAccountIds: process.env.FIREBLOCKS_VAULT_ACCOUNT_ID_DEPLOYER,
      },
    },
    amoy_metamask: {
      url: "https://rpc.ankr.com/polygon_amoy",
      accounts: [`0x${process.env.METAMASK_PRIVATE_KEY}`],
    },
  },
};
