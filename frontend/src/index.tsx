import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit"
import { configureChains, createConfig, WagmiConfig, Chain } from "wagmi"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"
import { mainnet, gnosis, polygon } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

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
  jsonRpcProvider({
    rpc: (chain) => ({
      http: `${process.env.REACT_APP_PROXY_URL}/${chain.id}/rpc`,
    }),
  }),
])

const projectId = REACT_APP_WALLET_CONNECT_PROJECT_ID
const { connectors } = getDefaultWallets({
  appName: "Mech",
  projectId,
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

// https://github.com/WalletConnect/walletconnect-monorepo/issues/748
// window.Buffer = window.Buffer || require("buffer").Buffer
const queryClient = new QueryClient()

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
