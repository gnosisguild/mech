import { Core } from "@walletconnect/core"
import { IWalletConnectSession } from "@walletconnect/legacy-types"
import { parseWalletConnectUri } from "@walletconnect/utils"
import LegacySignClient from "@walletconnect/client"
import Web3WalletClient, { Web3Wallet } from "@walletconnect/web3wallet"
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import useStickyState from "./useStickyState"

const core = new Core({
  projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
})

type LegacySession = {
  uri: string
  legacy: true
}

type Session =
  | {
      topic: string
      legacy?: false
    }
  | LegacySession

const metadata = {
  name: "Mech",
  description: "Sign with your mechs",
  url: "https://clubcard.global",
  icons: [],
}

const WalletConnectContext = createContext<{
  // client?: Web3WalletClient
  sessions: Session[]
  pair(uri: string): Promise<void>
}>({ sessions: [], pair: async () => {} })

interface Request {
  method: string
  params: unknown[]
}

interface Props {
  onRequest(props: { session: Session; request: Request }): Promise<string>
  children: ReactNode
}

export const ProvideWalletConnect: React.FC<Props> = ({
  onRequest,
  children,
}) => {
  const [client, setClient] = useState<Web3WalletClient>()
  const [sessions, setSessions] = useStickyState<Session[]>([], "sessions")
  const legacySignClientsRef = useRef(new Map<string, LegacySignClient>())

  const initLegacySignClient = useCallback(
    (session: Session) => {
      if (!session.legacy) {
        throw new Error("must only be called with legacy sessions")
      }

      console.log("initLegacySignClient", session)
      const legacySignClient = new LegacySignClient({ uri: session.uri })

      legacySignClient.on("session_request", (error, payload) => {
        if (error) {
          console.error(
            "legacySignClient > session_request failed",
            error,
            session
          )
        }
        console.log("legacy session_request", {
          payload,
          session,
        })
      })

      legacySignClient.on("connect", () => {
        console.log("legacySignClient > connect")
      })

      legacySignClient.on("error", (error) => {
        console.error("legacySignClient > on error", error)
      })

      legacySignClient.on("call_request", (error, payload) => {
        if (error) {
          console.error(
            "legacySignClient > call_request failed",
            error,
            session
          )
        }
        onRequest({ session, request: payload })
      })

      legacySignClient.on("disconnect", async () => {
        legacySignClientsRef.current.delete(session.uri)
        setSessions((sessions) =>
          sessions.filter((s) => s.legacy && s.uri !== session.uri)
        )
      })

      legacySignClientsRef.current.set(session.uri, legacySignClient)
    },
    [onRequest, setSessions]
  )

  useEffect(() => {
    sessions.forEach((session) => {
      if (session.legacy && !legacySignClientsRef.current.has(session.uri)) {
        initLegacySignClient(session)
      }
    })
  }, [sessions, initLegacySignClient])

  const pair = useCallback(
    async (uri: string) => {
      try {
        const { version } = parseWalletConnectUri(uri)

        if (version === 1) {
          setSessions((sessions) => [...sessions, { uri, legacy: true }])
        } else {
          if (!client) {
            throw new Error("client not initialized")
          }
          await client.core.pairing.pair({ uri })
        }
      } catch (err: unknown) {
        console.error(err)
      }
    },
    [client, setSessions]
  )

  useEffect(() => {
    const init = async () => {
      const client = await Web3Wallet.init({
        core,
        metadata,
      })
      setClient(client)

      client.on("session_proposal", async (proposal) => {
        const sessionStruct = await client.approveSession({
          id: proposal.id,
          namespaces: {},
        })

        const session = {
          topic: sessionStruct.topic,
        }

        setSessions((sessions) => [...sessions, session])
      })

      client.on("session_request", async (event) => {
        const { topic, params, id } = event
        const { request } = params
        const requestSession = client.getActiveSessions()[topic]
        console.log("session_request", event, requestSession, request)
        // const requestParamsMessage = request.params[0]

        const result = await onRequest({ session: requestSession, request })
        // switch (request.method) {
        //   case 'eth_sign':
        //   case 'personal_sign')
        //     result = onSign({session: requestSession, request})
        //   case 'eth_signTypedData':
        //   case 'eth_signTypedData_v3':
        //   case 'eth_signTypedData_v4':
        //     result = onSignTypedData?({session: requestSession, request})
        //   case 'eth_sendTransaction':
        //   case 'eth_signTransaction':
        //     result = onSendTransaction?({session: requestSession, request})
        // }

        // convert `requestParamsMessage` by using a method like hexToUtf8
        // const message = hexToUtf8(requestParamsMessage)

        // sign the message
        // const signedMessage = await wallet.signMessage(message)

        const response = { id, result, jsonrpc: "2.0" }
        await client.respondSessionRequest({ topic, response })
      })

      // TODO: handle auth_request
      client.on("auth_request", async (event) => {
        console.log("auth_request", event)
      })
    }

    init()
  }, [setSessions, onRequest])

  const packedContext = useMemo(
    () => ({
      pair,
      sessions,
    }),
    [pair, sessions]
  )

  if (!client) return null

  return (
    <WalletConnectContext.Provider value={packedContext}>
      {children}
    </WalletConnectContext.Provider>
  )
}

const useWalletConnect = () => {
  const context = useContext(WalletConnectContext)
  // if (!context.client)
  //   throw new Error("Must be used within <ProvideWalletConnect />")

  return context
}

export default useWalletConnect
