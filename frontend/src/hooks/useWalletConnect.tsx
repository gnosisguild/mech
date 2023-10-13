import { Core } from "@walletconnect/core"
import { buildApprovedNamespaces } from "@walletconnect/utils"
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

export type Session = { topic: string; metadata?: Metadata }

const metadata = {
  name: "Mech",
  description: "Sign with your mech",
  url: "https://mech.as",
  icons: [],
} satisfies Metadata

const PLACEHOLDER_PAIR = async () => {}
const PLACEHOLDER_DISCONNECT = async () => {}
const WalletConnectContext = createContext<{
  // client?: Web3WalletClient
  sessions: Session[]
  pair(uri: string): Promise<void>
  disconnect(topic: string): Promise<void>
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
    [topic: string]: Metadata | undefined
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

      const requiredAccounts =
        requiredNamespaces.eip155.chains?.map(
          (chain) => `${chain}:${mechAddress}`
        ) || []
      const requiredChains = requiredNamespaces.eip155.chains || []
      const requiredEvents = requiredNamespaces.eip155.events || []

      const approvedNamespaces = buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces: {
          eip155: {
            chains: [...requiredChains, `eip155:${chain.id}`],
            methods: [
              "eth_sendTransaction",
              "eth_signTransaction",
              "eth_sign",
              "personal_sign",
              "eth_signTypedData",
              "signTypedData_v1",
              "eth_signTypedData_v3",
              "eth_signTypedData_v4",
            ],
            events: requiredEvents,
            accounts: [
              ...requiredAccounts,
              `eip155:${chain.id}:${mechAddress}`,
            ],
          },
        },
      })

      const approveProps = {
        id: proposal.id,
        namespaces: approvedNamespaces,
      }
      console.log("approve session", approveProps)
      const { topic, peer } = await client.approveSession(approveProps)

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
        sessions.filter((s) => s.topic !== sessionDelete.topic)
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
        if (!client) {
          throw new Error("client not initialized")
        }

        try {
          await client.pair({ uri })
        } catch (err) {
          console.warn(err)
        }
      } catch (err: unknown) {
        console.error(err)
      }
    },
    [client]
  )

  const disconnect = useCallback(
    async (topic: string) => {
      const session = sessions.find((session) => session.topic === topic)

      if (session && client) {
        try {
          await client.disconnectSession({
            topic: topic,
            reason: {
              code: USER_DISCONNECTED_CODE,
              message: "User disconnected",
            },
          })
        } catch (e) {
          console.warn(e)
        }
      } else {
        console.warn("could not disconnect session", topic)
        return
      }

      setSessions(sessions.filter((s) => s.topic !== topic))
      setSessionsMetadata((sessionsMetadata) => ({
        ...sessionsMetadata,
        [topic]: undefined,
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
        metadata: sessionsMetadata[session.topic],
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
const INVALID_METHOD_ERROR_CODE = 1001
const USER_REJECTED_REQUEST_CODE = 4001
const USER_DISCONNECTED_CODE = 6000
