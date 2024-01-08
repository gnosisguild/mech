import { mainnet, polygon, gnosis } from "wagmi/chains"

import { Chain } from "viem/chains"

type ChainInfo = {
  [key: number]: { prefix: string } & Chain
}

export const CHAINS: ChainInfo = {
  [mainnet.id]: { ...mainnet, prefix: "eth" },
  [polygon.id]: { ...polygon, prefix: "matic" },
  [gnosis.id]: { ...gnosis, prefix: "gno" },
}

export type ChainId = keyof typeof CHAINS

export const DEFAULT_CHAIN = CHAINS[1]

export enum SequenceIndexerServices {
  MAINNET = "https://mainnet-indexer.sequence.app",

  POLYGON = "https://polygon-indexer.sequence.app",
  POLYGON_MUMBAI = "https://mumbai-indexer.sequence.app",

  POLYGON_ZKEVM = "https://polygon-zkevm-indexer.sequence.app",

  ARBITRUM = "https://arbitrum-indexer.sequence.app",
  ARBITRUM_NOVA = "https://arbitrum-nova-indexer.sequence.app",

  OPTIMISM = "https://optimism-indexer.sequence.app",
  AVALANCHE = "https://avalanche-indexer.sequence.app",
  GNOSIS = "https://gnosis-indexer.sequence.app",

  BSC = "https://bsc-indexer.sequence.app",
  BSC_TESTNET = "https://bsc-testnet-indexer.sequence.app",

  GOERLI = "https://goerli-indexer.sequence.app",
}

export const SEQUENCER_ENDPOINTS: Record<ChainId, SequenceIndexerServices> = {
  1: SequenceIndexerServices.MAINNET,
  5: SequenceIndexerServices.GOERLI,
  100: SequenceIndexerServices.GNOSIS,
  137: SequenceIndexerServices.POLYGON,
  80001: SequenceIndexerServices.POLYGON_MUMBAI,
}
