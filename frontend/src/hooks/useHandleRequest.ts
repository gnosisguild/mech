import { makeExecTransaction, signWithMech } from "mech-sdk"
import { useCallback } from "react"
import { useWalletClient } from "wagmi"
import { ProvideWalletConnect } from "./useWalletConnect"

export const useHandleRequest = (mechAddress: `0x${string}` | null) => {
  const { data: client } = useWalletClient()

  const handleRequest = useCallback<HandleRequest>(
    async ({ session, request }) => {
      if (!mechAddress) {
        throw new Error("mech address not available")
      }

      console.debug("handle request", { session, request })
      if (!client) {
        throw new Error("client not available")
      }

      switch (request.method) {
        // transaction need to be wrapped
        case "eth_sendTransaction": {
          const txFields = request.params[0] as TransactionFields
          // use ethers signer to auto-populate gas and nonce rather than using provider.send
          return await client.sendTransaction(
            makeExecTransaction(mechAddress, txFields)
          )
        }
        case "eth_signTransaction": {
          const txFields = request.params[0] as TransactionFields
          const tx = makeExecTransaction(mechAddress, txFields)
          return await client.request({
            method: "eth_signTransaction",
            params: [tx],
          } as any) // TODO the viem types are giving us a hard time here
        }

        case "eth_sign": {
          // replace mech address with signer address in the params
          const [, message] = request.params
          const ecdsaSignature = await client.request({
            method: request.method,
            params: [client.account, message],
          } as any) // TODO the viem types are giving us a hard time here
          return signWithMech(mechAddress, ecdsaSignature)
        }
        case "personal_sign": {
          // replace mech address with signer address in the params
          const [message, , password] = request.params
          const ecdsaSignature = await client.request({
            method: request.method,
            params: [message, client.account, password],
          } as any) // TODO the viem types are giving us a hard time here
          return signWithMech(mechAddress, ecdsaSignature)
        }

        case "eth_signTypedData":
        case "signTypedData_v1":
        case "eth_signTypedData_v3":
        case "eth_signTypedData_v4": {
          const typedData = request.params[1] as any
          const ecdsaSignature = await client.request({
            method: request.method,
            params: [client.account, typedData],
          } as any) // TODO the viem types are giving us a hard time here
          return signWithMech(mechAddress, ecdsaSignature)
        }

        default:
          try {
            return await client.request({
              method: request.method,
              params: request.params,
            } as any) // TODO the viem types are giving us a hard time here
          } catch (e: any) {
            let jsonRpcBody
            try {
              jsonRpcBody =
                typeof e === "object" &&
                "body" in e &&
                typeof e.body === "string"
                  ? JSON.parse(e.body)
                  : undefined
            } catch (pe) {}

            if (jsonRpcBody?.error?.code) {
              throw new JsonRpcError(
                jsonRpcBody.error.code,
                jsonRpcBody.error.message
              )
            }

            throw e
          }
      }
    },
    [mechAddress, client]
  )

  return handleRequest
}

type HandleRequest = React.ComponentProps<
  typeof ProvideWalletConnect
>["onRequest"]

interface TransactionFields {
  data: `0x${string}`
  from: `0x${string}`
  gas: string
  to: `0x${string}`
  value: string
}

export class JsonRpcError extends Error {
  jsonRpcCode: number
  jsonRpcMessage: string | null | undefined

  constructor(public code: number, message?: string | null) {
    super(`JSON-RPC error ${code}: ${message || ""}`)
    this.jsonRpcCode = code
    this.jsonRpcMessage = message
  }
}
