import { Core } from "@walletconnect/core"
import Web3WalletClient, { Web3Wallet } from "@walletconnect/web3wallet"
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import useStickyState from "./useStickyState"

const core = new Core({
  projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
})

type Session = {
  topic: string
}

const WalletConnectContext = createContext<{ client?: Web3WalletClient }>({})

const WalletConnectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [client, setClient] = useState<Web3WalletClient>()
  const [sessions, setSessions] = useStickyState<Session[]>([], "sessions")

  useEffect(() => {
    const init = async () => {
      const client = await Web3Wallet.init({
        core,
        metadata: {
          name: "Club Card",
          description: "Sign with your club cards",
          url: "clubcard.global",
          icons: [],
        },
      })
      setClient(client)

      client.on("session_proposal", async (proposal) => {
        const session = await client.approveSession({
          id: proposal.id,
          namespaces: {},
        })
      })

      client.on("session_request", async (event) => {
        const { topic, params, id } = event
        const { request } = params
        const requestParamsMessage = request.params[0]

        // convert `requestParamsMessage` by using a method like hexToUtf8
        const message = hexToUtf8(requestParamsMessage)

        // sign the message
        const signedMessage = await wallet.signMessage(message)

        const response = { id, result: signedMessage, jsonrpc: "2.0" }

        await client.respondSessionRequest({ topic, response })
      })
    }

    init()
  }, [])

  const packedContext = useMemo(
    () => ({
      client,
    }),
    [client]
  )

  if (!client) return null

  return (
    <WalletConnectContext.Provider value={packedContext}>
      {children}
    </WalletConnectContext.Provider>
  )
}

const useWalletConnect = (cardAddress: string) => {
  const context = useContext(WalletConnectContext)
  if (!context.client)
    throw new Error("Must be used within <WalletConnectProvider />")
}

export default useWalletConnect
