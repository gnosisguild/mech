import { useEffect, useState } from "react"
import { useProvider, useSigner } from "wagmi"
import { calculateMechAddress } from "../utils/calculateMechAddress"
import { makeMechDeployTransaction } from "../utils/deployMech"
import { MechNFT } from "./useNFTsByOwner"

export const useDeployMech = (token: MechNFT | null) => {
  const mechAddress = token && calculateMechAddress(token)
  const { data: signer } = useSigner()

  const provider = useProvider()
  const [deployed, setDeployed] = useState(false)
  useEffect(() => {
    if (!mechAddress) return
    provider.getCode(mechAddress).then((code) => setDeployed(code !== "0x"))
  }, [provider, mechAddress])

  const [deployPending, setDeployPending] = useState(false)
  const deploy = async () => {
    if (!signer || !token) return
    const tx = makeMechDeployTransaction(token)
    setDeployPending(true)
    try {
      const res = await signer.sendTransaction(tx)
      const receipt = await res.wait()
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
