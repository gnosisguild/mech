import { Core } from "@walletconnect/core"
import { Web3Wallet } from "@walletconnect/web3wallet"
import { useEffect } from "react"

const core = new Core({
  projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
})

const useWalletConnect = (cardAddress: string) => {
  useEffect(() => {
    const init = async () => {
      const web3wallet = await Web3Wallet.init({
        core,
        metadata: {
          name: "Club Card",
          description: "Sign with your club cards",
          url: "clubcard.global",
          icons: [],
        },
      })

      // TODO subscribe to events
    }

    init()
  }, [])
}

export default useWalletConnect
