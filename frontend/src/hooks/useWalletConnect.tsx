import { Core } from "@walletconnect/core"
import { parseWalletConnectUri } from "@walletconnect/utils"
import LegacySignClient from "@walletconnect/client"
import Web3WalletClient, {
  Web3Wallet,
  Web3WalletTypes,
} from "@walletconnect/web3wallet"
import { useNetwork } from "wagmi"
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

const web3WalletPromise = Web3Wallet.init({
  core,
  metadata,
})

export const ProvideWalletConnect: React.FC<Props> = ({
  chainId,
  mechAddress,
  onRequest,
  children,
}) => {
  const [client, setClient] = useState<Web3WalletClient>()
  useEffect(() => {
    web3WalletPromise.then((web3Wallet) => {
      setClient(web3Wallet)
    })
  }, [])

  const [sessions, setSessions] = useStickyState<Session[]>(
    [],
    `sessions-${chainId}:${mechAddress}`
  )
  const [sessionsMetadata, setSessionsMetadata] = useState<{
    [uriOrTopic: string]: Metadata | undefined
  }>({})

  // wrap onRequest to add error handling. Return value has either `result` or `error` for failed requests
  const handleRequest = useCallback(
    async ({ session, request }: { session: Session; request: Request }) => {
      console.debug("handleRequest", { session, request })
      let result = undefined
      let error = undefined
      try {
        result = await onRequest({ session, request })
      } catch (e: any) {
        console.debug("handleRequest error", e)

        let code = e?.code || e?.data?.code
        if (code === "ACTION_REJECTED") {
          // user rejected the action
          code = USER_REJECTED_REQUEST_CODE
        }
        if (code === "UNSUPPORTED_OPERATION") {
          code = INVALID_METHOD_ERROR_CODE
        }

        if (!code) throw e

        error = {
          code,
          message:
            e?.data?.message || e?.reason || e?.message || "unknown error",
        }
      }
      console.log("handleRequest response", { result, error })
      return { result, error }
    },
    [onRequest]
  )

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

      legacySignClient.on("call_request", async (err, payload) => {
        if (err) {
          console.error("legacySignClient > call_request failed", err, session)
        }
        const { result, error } = await handleRequest({
          session,
          request: payload,
        })
        if (error) {
          legacySignClient.rejectRequest({
            id: payload.id,
            error,
            jsonrpc: "2.0",
          })
        } else {
          legacySignClient.approveRequest({
            id: payload.id,
            result,
            jsonrpc: "2.0",
          })
        }
      })

      legacySignClient.on("disconnect", async () => {
        legacySignClientsRef.current.delete(session.uri)
        setSessions((sessions) =>
          sessions.filter((s) => s.legacy && s.uri !== session.uri)
        )
      })

      legacySignClientsRef.current.set(session.uri, legacySignClient)
    },
    [handleRequest, setSessions, chainId, mechAddress]
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
    if (!chain || !client) return

    const handleSessionProposal: (
      proposal: Web3WalletTypes.SessionProposal
    ) => Promise<void> | void = async (proposal) => {
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
    }

    const handleSessionRequest: (
      request: Web3WalletTypes.SessionRequest
    ) => Promise<void> | void = async (sessionRequest) => {
      const { topic, params, id } = sessionRequest
      const { request } = params
      const { result, error } = await handleRequest({
        session: { topic },
        request,
      })
      await client.respondSessionRequest({
        topic,
        response: {
          id,
          result,
          error,
          jsonrpc: "2.0",
        },
      })
    }

    const handleSessionDelete: (
      sessionDelete: Web3WalletTypes.SessionDelete
    ) => Promise<void> | void = async (sessionDelete) => {
      console.debug("session_delete", sessionDelete)
      setSessions((sessions) =>
        sessions.filter((s) => s.legacy || s.topic !== sessionDelete.topic)
      )
      setSessionsMetadata((sessionsMetadata) => ({
        ...sessionsMetadata,
        [sessionDelete.topic]: undefined,
      }))
    }

    // set metadata for existing sessions
    const activeSessions = client.getActiveSessions()
    const metaEntries = sessionsAtMountRef.current
      .map((session) => {
        if (session.legacy) return undefined
        const activeSession = activeSessions[session.topic]
        if (!activeSession) return undefined
        return [session.topic, activeSession.peer.metadata]
      })
      .filter(Boolean) as [string, Metadata][]
    setSessionsMetadata((sessionsMetadata) => ({
      ...sessionsMetadata,
      ...Object.fromEntries(metaEntries),
    }))

    client.on("session_proposal", handleSessionProposal)
    client.on("session_request", handleSessionRequest)
    client.on("session_delete", handleSessionDelete)

    // TODO: handle auth_request
    // client.on("auth_request", async (event) => {
    //   console.debug("auth_request", event)
    // })

    return () => {
      if (!client) return
      client.off("session_proposal", handleSessionProposal)
      client.off("session_request", handleSessionRequest)
      client.off("session_delete", handleSessionDelete)
    }
  }, [client, setSessions, handleRequest, chain, mechAddress])

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
            await client.pair({ uri })
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

      const session = sessions.find(
        (session) => !session.legacy && session.topic === uriOrTopic
      )

      if (legacySession) {
        const legacySignClient = new LegacySignClient({
          uri: uriOrTopic,
        })
        legacySignClient.killSession()
      } else if (session && client) {
        try {
          await client.disconnectSession({
            topic: uriOrTopic,
            reason: {
              code: USER_DISCONNECTED_CODE,
              message: "User disconnected",
            },
          })
        } catch (e) {
          console.warn(e)
        }
      } else {
        console.warn("could not disconnect session", uriOrTopic)
        return
      }

      setSessions(
        sessions.filter((s) =>
          s.legacy ? s.uri !== uriOrTopic : s.topic !== uriOrTopic
        )
      )
      setSessionsMetadata((sessionsMetadata) => ({
        ...sessionsMetadata,
        [uriOrTopic]: undefined,
      }))
    },
    [sessions, setSessions, client]
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
