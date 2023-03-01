import { makeExecTransaction } from "mech-sdk"
import { useSendTransaction } from "wagmi"
import { ProvideWalletConnect } from "./useWalletConnect"

export const useHandleRequest = (mechAddress: string) => {
  const { sendTransactionAsync } = useSendTransaction({
    mode: "recklesslyUnprepared",
  })

  const handleRequest: HandleRequest = async ({ session, request }) => {
    console.debug("handle request", { session, request })

    switch (request.method) {
      case "eth_sendTransaction":
        const txFields = request.params[0] as TransactionFields
        const res = await sendTransactionAsync({
          recklesslySetUnpreparedRequest: makeExecTransaction(
            mechAddress,
            txFields
          ),
        })
        return res.hash

      default:
        throw new Error(`not implemented: ${request.method}`)
    }
  }

  return handleRequest
}

type HandleRequest = React.ComponentProps<
  typeof ProvideWalletConnect
>["onRequest"]

interface TransactionFields {
  data: string
  from: string
  gas: string
  to: string
  value: string
}
