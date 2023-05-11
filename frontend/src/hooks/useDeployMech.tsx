import { useEffect, useState } from "react"
import { useChainId, useProvider, useSigner } from "wagmi"
import {
  calculateERC721MechAddress,
  makeERC1155MechDeployTransaction,
  makeERC721MechDeployTransaction,
} from "mech-sdk"

export const useDeployMech = (
  token: string,
  tokenId: string,
  tokenStandard: "ERC-721" | "ERC-1155" = "ERC-721"
) => {
  const mechAddress = calculateERC721MechAddress(token, tokenId)
  const { data: signer } = useSigner()
  const chainId = useChainId()

  const provider = useProvider()
  const [deployed, setDeployed] = useState(false)
  useEffect(() => {
    provider.getCode(mechAddress).then((code) => setDeployed(code !== "0x"))
  }, [provider, mechAddress])

  const [deployPending, setDeployPending] = useState(false)
  const deploy = async () => {
    if (!signer) return
    const tx =
      tokenStandard === "ERC-721"
        ? makeERC721MechDeployTransaction(token, tokenId, chainId)
        : makeERC1155MechDeployTransaction(token, [tokenId], [1], 1, chainId)
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
