require('dotenv').config();
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-chai-matchers';
import { HardhatUserConfig } from 'hardhat/types';
import 'hardhat-contract-sizer';
import '@nomiclabs/hardhat-etherscan';

import dotenv from 'dotenv';
import glob from 'glob';
import path from 'path';

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const DEV_SEED: string = process.env.DEV_SEED || '';
const ETHERSCAN_API_KEY: string = process.env.ETHERSCAN_API_KEY || '';
const RINKEBY_ALCHEMY_URL: string = process.env.RINKEBY_ALCHEMY_URL || '';
const GOERLI_ALCHEMY_URL: string = process.env.GOERLI_ALCHEMY_URL || '';
const MAINNET_ALCHEMY_URL: string = process.env.MAINNET_ALCHEMY_URL || '';
const OPTIMISM_KOVAN_ALCHEMY_URL: string = process.env.OPTIMISM_KOVAN_ALCHEMY_URL || '';
const COINMARKETCAP_API_KEY: string = process.env.COINMARKETCAP_API_KEY || '';

// glob.sync('./tasks/*.ts').forEach((file: string) => {
//   require(path.resolve(file))
// })

let config: HardhatUserConfig = {
  solidity: {
    version: '0.8.13',
    settings: {
      optimizer: {
        enabled: true,
        runs: 125,
      },
    },
  },

  defaultNetwork: 'hardhat',
  networks: {
    local: {
      url: 'http://127.0.0.1:8545',
      timeout: 0,
    },

    hardhat: {},

    goerli: {
      url: process.env.GOERLI_ALCHEMY_URL,
      accounts: [process.env.DEV_SEED || ''],
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },

  gasReporter: {
    enabled: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
    currency: 'USD',
  },

  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
};

export default config;
