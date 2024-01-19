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
