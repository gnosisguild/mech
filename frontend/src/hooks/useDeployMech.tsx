import { useState } from "react"
import { usePublicClient, useWalletClient } from "wagmi"
import { makeMechDeployTransaction } from "../utils/deployMech"
import { MechNFT } from "./useNFTsByOwner"

export const useDeployMech = (token: MechNFT | null) => {
  const { data: walletClient } = useWalletClient()

  const publicClient = usePublicClient()
  const [deployed, setDeployed] = useState(token?.hasMech || false)

  const [deployPending, setDeployPending] = useState(false)
  const deploy = async () => {
    if (!walletClient || !token) return
    const tx = makeMechDeployTransaction(token)
    setDeployPending(true)
    try {
      const hash = await walletClient.sendTransaction(tx)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      setDeployed(true)
      return receipt
    } catch (e) {
      console.error(e)
    } finally {
      setDeployPending(false)
    }
  }

  return { deployed, deploy, deployPending }
}
