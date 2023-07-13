import React from "react"
import ReactDOM from "react-dom/client"
import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum"

import { Web3Modal } from "@web3modal/react"
import { RouterProvider } from "react-router-dom"
import "./index.css"

import { configureChains, createConfig, WagmiConfig } from "wagmi"

import { infuraProvider } from "@wagmi/core/providers/infura"
import { publicProvider } from "@wagmi/core/providers/public"
import router from "./router"
import { CHAINS } from "./chains"

const { REACT_APP_WALLET_CONNECT_PROJECT_ID } = process.env
if (!REACT_APP_WALLET_CONNECT_PROJECT_ID) {
  throw new Error("REACT_APP_WALLET_CONNECT_PROJECT_ID is not set")
}

const { chains, publicClient } = configureChains(Object.values(CHAINS), [
  w3mProvider({
    projectId: REACT_APP_WALLET_CONNECT_PROJECT_ID,
  }),
  infuraProvider({ apiKey: process.env.REACT_APP_INFURA_KEY || "" }),
  publicProvider(),
])

export { chains }

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({
    projectId: REACT_APP_WALLET_CONNECT_PROJECT_ID,
    chains,
  }),
  publicClient,
})

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiConfig, chains)

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

// https://github.com/WalletConnect/walletconnect-monorepo/issues/748
// window.Buffer = window.Buffer || require("buffer").Buffer

root.render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
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
