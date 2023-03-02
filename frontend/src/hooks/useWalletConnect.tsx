import { Core } from "@walletconnect/core"
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
import { useNetwork } from "wagmi"

const core = new Core({
  projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
})

type Metadata = {
  name: string
  description: string
  url: string
  icons: string[]
}

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

export type SessionWithMetadata = Session & { metadata?: Metadata }

const metadata = {
  name: "Mech",
  description: "Sign with your mech",
  url: "https://clubcard.global",
  icons: [],
} satisfies Metadata

const PLACEHOLDER_PAIR = async () => {}
const PLACEHOLDER_DISCONNECT = async () => {}
const WalletConnectContext = createContext<{
  // client?: Web3WalletClient
  sessions: SessionWithMetadata[]
  pair(uri: string): Promise<void>
  disconnect(uriOrTopic: string): Promise<void>
}>({ sessions: [], pair: PLACEHOLDER_PAIR, disconnect: PLACEHOLDER_DISCONNECT })

interface Request {
  method: string
  params: unknown[]
}

interface Props {
  onRequest(props: { session: Session; request: Request }): Promise<string>
  children: ReactNode
  chainId: number
  mechAddress: string
}

export const ProvideWalletConnect: React.FC<Props> = ({
  chainId,
  mechAddress,
  onRequest,
  children,
}) => {
  const [client, setClient] = useState<Web3WalletClient>()
  const [sessions, setSessions] = useStickyState<Session[]>(
    [],
    `sessions-${chainId}:${mechAddress}`
  )
  const [sessionsMetadata, setSessionsMetadata] = useState<{
    [uriOrTopic: string]: Metadata | undefined
  }>({})

  /**
   * LEGACY WALLET CONNECT V1 SUPPORT
   */
  const legacySignClientsRef = useRef(new Map<string, LegacySignClient>())

  const initLegacySignClient = useCallback(
    (session: Session) => {
      if (!session.legacy) {
        throw new Error("must only be called with legacy sessions")
      }

      const legacySignClient = new LegacySignClient({ uri: session.uri })

      const { peerMeta } = legacySignClient
      if (peerMeta) {
        setSessionsMetadata((sessionsMetadata) => ({
          ...sessionsMetadata,
          [session.uri]: peerMeta,
        }))
      }

      legacySignClient.on("session_request", (error, payload) => {
        if (error) {
          console.error(
            "legacySignClient > session_request failed",
            error,
            session
          )
        }
        console.debug("legacy session_request", {
          payload,
          session,
        })

        const { peerMeta } = payload.params[0] || {}
        setSessionsMetadata((sessionsMetadata) => ({
          ...sessionsMetadata,
          [session.uri]: peerMeta,
        }))

        legacySignClient.approveSession({
          accounts: [mechAddress],
          chainId,
        })
      })

      legacySignClient.on("connect", () => {
        console.debug("legacySignClient > connect")
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
    [onRequest, setSessions, chainId, mechAddress]
  )

  useEffect(() => {
    sessions.forEach((session) => {
      if (session.legacy && !legacySignClientsRef.current.has(session.uri)) {
        initLegacySignClient(session)
      }
    })
  }, [sessions, initLegacySignClient])

  /**
   *  WALLET CONNECT V2 SUPPORT
   */
  const { chain } = useNetwork()
  const sessionsAtMountRef = useRef(sessions)
  useEffect(() => {
    if (!chain) return

    const init = async () => {
      const client = await Web3Wallet.init({
        core,
        metadata,
      })
      setClient(client)

      // set metadata for existing sessions
      const activeSessions = client.getActiveSessions()
      const metaEntries = sessionsAtMountRef.current
        .map(
          (session) =>
            !session.legacy && [
              session.topic,
              activeSessions[session.topic].peer.metadata,
            ]
        )
        .filter(Boolean) as [string, Metadata][]
      setSessionsMetadata((sessionsMetadata) => ({
        ...sessionsMetadata,
        ...Object.fromEntries(metaEntries),
      }))

      client.on("session_proposal", async (proposal) => {
        console.debug("session_proposal", proposal)
        const { requiredNamespaces } = proposal.params

        // eip155 namespace should be present
        if (!requiredNamespaces.eip155) {
          const error = `Unsupported chains. No eip155 namespace present in the session proposal`
          console.warn(error, proposal)
          await client.rejectSession({
            id: proposal.id,
            reason: {
              code: UNSUPPORTED_CHAIN_ERROR_CODE,
              message: error,
            },
          })
          return
        }

        // chain should be present
        const isChainIdPresent = requiredNamespaces.eip155.chains?.some(
          (ns) => ns === `eip155:${chain.id}`
        )
        if (!isChainIdPresent) {
          const error = `Unsupported chains. No eip155:${chain.id} namespace present in the session proposal`
          console.warn(error, proposal)
          await client.rejectSession({
            id: proposal.id,
            reason: {
              code: UNSUPPORTED_CHAIN_ERROR_CODE,
              message: error,
            },
          })
          return
        }

        const accounts = requiredNamespaces.eip155.chains?.map(
          (chain) => `${chain}:${mechAddress}`
        )

        const { topic, peer } = await client.approveSession({
          id: proposal.id,
          namespaces: {
            eip155: {
              accounts: accounts || [`eip155:${chain.id}:${mechAddress}`],
              methods: requiredNamespaces.eip155.methods,
              events: requiredNamespaces.eip155.events,
            },
          },
        })

        setSessions((sessions) => [...sessions, { topic }])
        setSessionsMetadata((sessionsMetadata) => ({
          ...sessionsMetadata,
          [topic]: peer.metadata,
        }))
      })

      client.on("session_request", async (event) => {
        const { topic, params, id } = event
        const { request } = params
        const requestSession = client.getActiveSessions()[topic]
        console.debug("session_request", event, requestSession, request)

        const result = await onRequest({ session: { topic }, request })

        const response = { id, result, jsonrpc: "2.0" }
        await client.respondSessionRequest({ topic, response })
      })

      // TODO: handle auth_request
      // client.on("auth_request", async (event) => {
      //   console.debug("auth_request", event)
      // })

      client.on("session_delete", async (event) => {
        console.debug("session_delete", event)
        setSessions((sessions) =>
          sessions.filter((s) => !s.legacy && s.topic === event.topic)
        )
        setSessionsMetadata((sessionsMetadata) => ({
          ...sessionsMetadata,
          [event.topic]: undefined,
        }))
      })
    }

    init()
  }, [setSessions, onRequest, chain, mechAddress])

  /**
   * HANDLERS
   */
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

          try {
            await client.core.pairing.pair({ uri })
          } catch (err) {
            console.warn(err)
          }
        }
      } catch (err: unknown) {
        console.error(err)
      }
    },
    [client, setSessions]
  )

  const disconnect = useCallback(
    async (uriOrTopic: string) => {
      const legacySession = sessions.find(
        (session) => session.legacy && session.uri === uriOrTopic
      ) as LegacySession | undefined
      if (legacySession) {
        const legacySignClient = new LegacySignClient({
          uri: legacySession.uri,
        })
        legacySignClient.killSession()
        setSessions(sessions.filter((s) => s !== legacySession))
        setSessionsMetadata((sessionsMetadata) => ({
          ...sessionsMetadata,
          [legacySession.uri]: undefined,
        }))
      }

      // TODO handle V2 disconnect
    },
    [sessions, setSessions]
  )

  const packedContext = useMemo(
    () => ({
      pair,
      disconnect,
      sessions: sessions.map((session) => ({
        ...session,
        metadata:
          sessionsMetadata[session.legacy ? session.uri : session.topic],
      })),
    }),
    [pair, disconnect, sessions, sessionsMetadata]
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
  if (context.pair === PLACEHOLDER_PAIR) {
    throw new Error("Must be used within <ProvideWalletConnect />")
  }

  return context
}

export default useWalletConnect

// see https://docs.walletconnect.com/2.0/specs/sign/error-codes
const UNSUPPORTED_CHAIN_ERROR_CODE = 5100
const INVALID_METHOD_ERROR_CODE = 1001
const USER_REJECTED_REQUEST_CODE = 4001
const USER_DISCONNECTED_CODE = 6000
