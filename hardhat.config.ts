import "@nomicfoundation/hardhat-toolbox"

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
import "./tasks/faucet"

import { HardhatUserConfig } from "hardhat/config"

export default {
  // solidity: "0.8.17",
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337, // This is the value used in the @gnosis.pm/zodiac package (important for looking up the ModuleProxyFactory address)
    },
  },
} satisfies HardhatUserConfig
