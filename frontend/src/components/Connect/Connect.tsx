import React, { useState } from "react"
import useWalletConnect, {
  SessionWithMetadata,
} from "../../hooks/useWalletConnect"
import Spinner from "../Spinner"

import classes from "./Connect.module.css"
import Button from "../Button"
import { useDeployMech } from "../../hooks/useDeployMech"

interface Props {
  token: string
  tokenId: string
}

const MechConnect: React.FC<Props> = ({ token, tokenId }) => {
  const { pair, disconnect, sessions } = useWalletConnect()
  const [loading, setLoading] = useState(false)
  const [uri, setUri] = useState("")

  const { deployed } = useDeployMech(token, tokenId)

  const disconnectAll = () => {
    sessions.forEach((session) => {
      disconnect(session.legacy ? session.uri : session.topic)
    })
  }

  const handleChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const uri = ev.target.value
    setUri(uri)
    try {
      await pair(uri)
    } catch (err: unknown) {
      console.error(err)
    } finally {
      setUri("")
      setLoading(false)
    }
  }

  return (
    <div className={classes.container}>
      <h3>App Connect</h3>
      <div className={classes.connectInput}>
        {deployed ? (
          <label>
            Copy and paste the Wallet Connect link here to connect this Mech to
            an app.
          </label>
        ) : (
          <label>
            Deploy this Mech to connect it to apps and sign in its capacity
          </label>
        )}
        <input
          type="text"
          value={uri}
          onChange={handleChange}
          placeholder="wc:9e5b70f5-ddef-4403-999e-"
          disabled={!deployed}
        />
      </div>
      {loading && <Spinner />}

      <h4>Connections</h4>
      <ul className={classes.sessions}>
        {sessions.map((session, index) => (
          <SessionItem
            key={`session-${index}`}
            session={session}
            disconnect={disconnect}
          />
        ))}
      </ul>
      <Button
        secondary
        onClick={disconnectAll}
        className={classes.disconnectAll}
        disabled={sessions.length === 0}
      >
        Disconnect All
      </Button>
    </div>
  )
}

export default MechConnect

const SessionItem: React.FC<{
  session: SessionWithMetadata
  disconnect: (uriOrTopic: string) => void
}> = ({ session, disconnect }) => {
  const icon = session.metadata?.icons[0]
  const name = session.metadata?.name || "Session"
  return (
    <li title={session.metadata?.description}>
      {icon && (
        <img
          src={icon}
          alt={name}
          className={classes.icon}
          style={{ height: 24 }}
        />
      )}
      <span className={classes.name}>{name}</span>
      <a
        href={session.metadata?.url}
        rel="external nofollow noreferrer"
        target="_blank"
      >
        <ExternalLinkIcon />
      </a>
      <Button
        secondary
        onClick={() => disconnect(session.legacy ? session.uri : session.topic)}
        className={classes.disconnect}
        title="Disconnect"
      >
        ✕
      </Button>
    </li>
  )
}

const ExternalLinkIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z"></path>
    </g>
  </svg>
)
