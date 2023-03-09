import "@nomicfoundation/hardhat-toolbox"
import "hardhat-gas-reporter"
import "hardhat-deploy"

import dotenv from "dotenv"
import { HardhatUserConfig, HttpNetworkUserConfig } from "hardhat/types"

dotenv.config()
const { INFURA_KEY, MNEMONIC, ETHERSCAN_API_KEY } = process.env
const DEFAULT_MNEMONIC =
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"

const sharedNetworkConfig: HttpNetworkUserConfig = {}

sharedNetworkConfig.accounts = {
  mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
}

const { INTEGRATION_TEST } = process.env

if (INTEGRATION_TEST) {
  console.log("Running integration tests on mainnet fork")
}

let config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337, // This is the value used in the @gnosis.pm/zodiac package (important for looking up the ModuleProxyFactory address)
    },
    mainnet: {
      ...sharedNetworkConfig,
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    goerli: {
      ...sharedNetworkConfig,
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
    },
    xdai: {
      ...sharedNetworkConfig,
      url: "https://rpc.gnosischain.com/",
    },
    matic: {
      ...sharedNetworkConfig,
      url: "https://rpc-mainnet.maticvigil.com",
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: true,
  },
}

if (INTEGRATION_TEST) {
  config = {
    ...config,
    networks: {
      ...config.networks,
      hardhat: {
        forking: {
          ...sharedNetworkConfig,
          url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
        },
      },
    },
    paths: {
      tests: "./integrationTest",
    },
  }
}

export default config
