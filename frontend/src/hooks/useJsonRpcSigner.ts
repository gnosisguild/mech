import { JsonRpcSigner } from "@ethersproject/providers"
import { useSigner } from "wagmi"

export const useJsonRpcSigner = () => {
  const { data: signer } = useSigner()

  if (!signer) return undefined

  if (!("provider" in signer)) {
    throw new Error("wagmi signer is not a JsonRpcSigner")
  }

  return signer as JsonRpcSigner
}
