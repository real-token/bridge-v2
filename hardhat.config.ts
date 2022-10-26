import * as dotenv from "dotenv";

import { HardhatUserConfig, task, types } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-solhint";

import networks from "./hardhat.networks";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("getNonce", "Get current nonce").setAction(async ({ target }, hre) => {
  const [DEPLOYER] = await hre.ethers.getSigners();
  const nonce = await hre.ethers.provider.getTransactionCount(DEPLOYER.address);

  console.log(
    `Current nonce on ${hre.network.name.toUpperCase()} is: ` + nonce
  );
});

task("upNonce", "Increase nonce by one").setAction(async ({ target }, hre) => {
  const [DEPLOYER] = await hre.ethers.getSigners();
  const oldNonce = await hre.ethers.provider.getTransactionCount(
    DEPLOYER.address
  );

  const tx = await hre.web3.eth.sendTransaction({
    from: DEPLOYER.address,
    to: DEPLOYER.address,
  });

  const newNonce = await hre.ethers.provider.getTransactionCount(
    DEPLOYER.address
  );
  console.log(
    `${oldNonce} -> ${newNonce} | Nonce increased! Tx: ` + tx.transactionHash
  );
});

task("nonce", "Increase the nonce value by sending self transaction")
  .addParam("target", "Target nonce you want to achieve", 0, types.int)
  .setAction(async ({ target }, hre) => {
    const [DEPLOYER] = await hre.ethers.getSigners();
    const nonce = await hre.ethers.provider.getTransactionCount(
      DEPLOYER.address
    );
    if (!target) return console.log("Target can't be 0");
    if (nonce >= target)
      console.log(
        `Your current nonce (${nonce}) is superior or equal to target nonce: ${target}`
      );

    const todo = target - nonce;

    console.log(`${todo} transaction difference, let's go!`);
    for (let i = 0; i < todo; i++) {
      const tx = await hre.web3.eth.sendTransaction({
        from: DEPLOYER.address,
        to: DEPLOYER.address,
      });
      console.log("Nonce increased! Tx: " + tx.transactionHash);
    }

    const newNonce = await hre.web3.eth.getTransactionCount(DEPLOYER.address);

    console.log("Next transaction nonce is now : " + newNonce);
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.6.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.4.25",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      }
    ],
  },
  mocha: {
    timeout: 100000000,
  },
  typechain: {
    outDir: "typechain",
  },
  networks,
  gasReporter: {
    coinmarketcap: process.env.REPORT_GAS,
    gasPriceApi: process.env.GAS_PRICE,
    token: "DAI",
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.MAIN_ETHERSCAN_API_KEY ?? "",
      gnosis: process.env.GNOSIS_ETHERSCAN_API_KEY ?? "",
    },
    customChains: [
      {
        network: "gnosis",
        chainId: 100,
        urls: {
          apiURL: "https://api.gnosisscan.io/api",
          browserURL: "https://gnosisscan.io/",
        },
      },
    ],
  },
};

export default config;
