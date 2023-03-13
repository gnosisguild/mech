import { useEffect, useState } from "react"
import { useProvider, useSigner } from "wagmi"
import {
  calculateERC721MechAddress,
  makeERC721MechDeployTransaction,
} from "mech-sdk"

export const useDeployMech = (token: string, tokenId: string) => {
  const mechAddress = calculateERC721MechAddress(token, tokenId)
  const { data: signer } = useSigner()

  const provider = useProvider()
  const [deployed, setDeployed] = useState(false)
  useEffect(() => {
    provider.getCode(mechAddress).then((code) => setDeployed(code !== "0x"))
  }, [provider, mechAddress])

  const [deployPending, setDeployPending] = useState(false)
  const deploy = async () => {
    if (!signer) return
    const tx = makeERC721MechDeployTransaction(token, tokenId)
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
