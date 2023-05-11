import React from "react"
import ReactDOM from "react-dom/client"
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum"

import { Web3Modal } from "@web3modal/react"
import { RouterProvider } from "react-router-dom"
import "./index.css"

import { configureChains, createClient, WagmiConfig } from "wagmi"
import {
  mainnet,
  goerli,
  avalanche,
  arbitrum,
  bsc,
  polygon,
  gnosis,
} from "wagmi/chains"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"
import { infuraProvider } from "@wagmi/core/providers/infura"
import router from "./router"
import { CHAINS } from "./chains"

const { REACT_APP_WALLET_CONNECT_PROJECT_ID } = process.env
if (!REACT_APP_WALLET_CONNECT_PROJECT_ID) {
  throw new Error("REACT_APP_WALLET_CONNECT_PROJECT_ID is not set")
}

const { chains, provider } = configureChains(
  [mainnet, goerli, avalanche, arbitrum, bsc, polygon, gnosis],
  [
    walletConnectProvider({
      projectId: REACT_APP_WALLET_CONNECT_PROJECT_ID,
    }),
    jsonRpcProvider({
      rpc: (chain) => {
        return (CHAINS as any)[chain.id]?.rpc
      },
    }),
    infuraProvider({ apiKey: process.env.REACT_APP_INFURA_KEY || "" }),
  ]
)

export { chains }

const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({
    projectId: REACT_APP_WALLET_CONNECT_PROJECT_ID,
    version: "2",
    appName: "Mech",
    chains,
  }),
  provider,
})

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiClient, chains)

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

// https://github.com/WalletConnect/walletconnect-monorepo/issues/748
// window.Buffer = window.Buffer || require("buffer").Buffer

root.render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
      <RouterProvider router={router} />
    </WagmiConfig>

    <Web3Modal
      projectId={REACT_APP_WALLET_CONNECT_PROJECT_ID}
      ethereumClient={ethereumClient}
    />
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
