import {
  mainnet,
  goerli,
  avalanche,
  arbitrum,
  bsc,
  polygon,
  gnosis,
} from "wagmi/chains"

export const CHAINS = {
  [mainnet.id]: { ...mainnet, prefix: "eth" },
  [goerli.id]: { ...goerli, prefix: "gor" },
  [avalanche.id]: { ...avalanche, prefix: "avax" },
  [arbitrum.id]: { ...arbitrum, prefix: "arb1" },
  [bsc.id]: { ...bsc, prefix: "bnb" },
  [polygon.id]: { ...polygon, prefix: "matic" },
  [gnosis.id]: { ...gnosis, prefix: "gno" },
}

export type ChainId = keyof typeof CHAINS

export const DEFAULT_CHAIN = CHAINS[5]
