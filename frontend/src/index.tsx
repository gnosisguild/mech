import React from "react"
import ReactDOM from "react-dom/client"
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
import { InjectedConnector } from "wagmi/connectors/injected"
import { WalletConnectConnector } from "@wagmi/core/connectors/walletConnect"
import { CoinbaseWalletConnector } from "@wagmi/core/connectors/coinbaseWallet"

const { chains, provider } = configureChains(
  [mainnet, goerli, avalanche, arbitrum, bsc, polygon, gnosis],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        switch (chain.id) {
          case 56:
            return { http: "https://bsc-dataseed.binance.org/" }
          case 100:
            return { http: "https://rpc.gnosis.gateway.fm" }
          case 43114:
            return { http: "https://api.avax.network/ext/bc/C/rpc" }
          default:
            return null
        }
      },
    }),
    infuraProvider({ apiKey: process.env.REACT_APP_INFURA_KEY || "" }),
  ]
)

const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({ chains, options: { qrcode: true } }),
    new CoinbaseWalletConnector({
      options: {
        appName: "Club Card",
      },
    }),
  ],
  provider,
})

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

// https://github.com/WalletConnect/walletconnect-monorepo/issues/748
window.Buffer = window.Buffer || require("buffer").Buffer

root.render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>TODO</WagmiConfig>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
