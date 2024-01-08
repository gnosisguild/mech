import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit"
import { configureChains, createConfig, WagmiConfig } from "wagmi"
import { infuraProvider } from "wagmi/providers/infura"
import { publicProvider } from "wagmi/providers/public"
import { mainnet, gnosis, polygon } from "wagmi/chains"

import "./index.css"
import "@rainbow-me/rainbowkit/styles.css"

import router from "./router"

window.Buffer = window.Buffer || require("buffer").Buffer

const { REACT_APP_WALLET_CONNECT_PROJECT_ID } = process.env
if (!REACT_APP_WALLET_CONNECT_PROJECT_ID) {
  throw new Error("REACT_APP_WALLET_CONNECT_PROJECT_ID is not set")
}

const supportedChains = [mainnet, gnosis, polygon]
const { chains, publicClient } = configureChains(supportedChains, [
  infuraProvider({ apiKey: process.env.REACT_APP_INFURA_KEY || "" }),
  publicProvider(),
])

const projectId = REACT_APP_WALLET_CONNECT_PROJECT_ID
const { connectors } = getDefaultWallets({
  appName: "Mech",
  projectId,
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
})

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

// https://github.com/WalletConnect/walletconnect-monorepo/issues/748
// window.Buffer = window.Buffer || require("buffer").Buffer

root.render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({
          accentColor: "rgba(192, 255, 12, 0.3)",
          accentColorForeground: "rgba(89, 120, 0, 1)",
          borderRadius: "medium",
          fontStack: "system",
          overlayBlur: "small",
        })}
      >
        <RouterProvider router={router} />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
