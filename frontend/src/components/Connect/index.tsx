import React, { useState } from "react"
import useWalletConnect, {
  SessionWithMetadata,
} from "../../hooks/useWalletConnect"
import Spinner from "../Spinner"

import classes from "./Connect.module.css"
import Button from "../Button"

const MechConnect: React.FC = () => {
  const { pair, disconnect, sessions } = useWalletConnect()
  const [loading, setLoading] = useState(false)
  const [uri, setUri] = useState("")

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
        <label>
          Copy and paste the WalletConnect link here to connect this Mech to an
          app.
        </label>
        <input
          type="text"
          value={uri}
          onChange={handleChange}
          placeholder="wc:9e5b70f5-ddef-4403-999e-"
        />
      </div>
      {loading && <Spinner />}

      {sessions.length > 0 && (
        <>
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
        </>
      )}
    </div>
  )
}

export default MechConnect

const SessionItem: React.FC<{
  session: SessionWithMetadata
  disconnect: (uriOrTopic: string) => void
}> = ({ session, disconnect }) => {
  const icon = session.metadata?.icons[0] || walletConnectLogo
  const name = session.metadata?.name || "Connection"
  return (
    <li title={session.metadata?.description}>
      <img
        src={icon}
        alt={name}
        className={classes.icon}
        style={{ height: 24 }}
      />
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

;<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="#999" />
  <path
    fill="#ccc"
    stroke="none"
    d="M25.322 33.597c12.525-12.263 32.83-12.263 45.355 0l1.507 1.476a1.547 1.547 0 0 1 0 2.22l-5.156 5.048a.814.814 0 0 1-1.134 0l-2.074-2.03c-8.737-8.555-22.903-8.555-31.64 0l-2.222 2.175a.814.814 0 0 1-1.134 0l-5.156-5.049a1.547 1.547 0 0 1 0-2.22l1.654-1.62Zm56.019 10.44 4.589 4.494a1.547 1.547 0 0 1 0 2.22l-20.693 20.26a1.628 1.628 0 0 1-2.267 0L48.283 56.632a.407.407 0 0 0-.567 0L33.03 71.012a1.628 1.628 0 0 1-2.268 0L10.07 50.75a1.547 1.547 0 0 1 0-2.22l4.59-4.494a1.628 1.628 0 0 1 2.267 0l14.687 14.38c.156.153.41.153.567 0l14.685-14.38a1.628 1.628 0 0 1 2.268 0l14.687 14.38c.156.153.41.153.567 0l14.686-14.38a1.628 1.628 0 0 1 2.268 0Z"
  ></path>
</svg>
//
const walletConnectLogo =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogIDxyZWN0IHdpZHRoPSI5NiIgaGVpZ2h0PSI5NiIgZmlsbD0iIzQ0NCIgLz4NCiAgPHBhdGgNCiAgICBmaWxsPSIjY2NjIg0KICAgIHN0cm9rZT0ibm9uZSINCiAgICBkPSJNMjUuMzIyIDMzLjU5N2MxMi41MjUtMTIuMjYzIDMyLjgzLTEyLjI2MyA0NS4zNTUgMGwxLjUwNyAxLjQ3NmExLjU0NyAxLjU0NyAwIDAgMSAwIDIuMjJsLTUuMTU2IDUuMDQ4YS44MTQuODE0IDAgMCAxLTEuMTM0IDBsLTIuMDc0LTIuMDNjLTguNzM3LTguNTU1LTIyLjkwMy04LjU1NS0zMS42NCAwbC0yLjIyMiAyLjE3NWEuODE0LjgxNCAwIDAgMS0xLjEzNCAwbC01LjE1Ni01LjA0OWExLjU0NyAxLjU0NyAwIDAgMSAwLTIuMjJsMS42NTQtMS42MlptNTYuMDE5IDEwLjQ0IDQuNTg5IDQuNDk0YTEuNTQ3IDEuNTQ3IDAgMCAxIDAgMi4yMmwtMjAuNjkzIDIwLjI2YTEuNjI4IDEuNjI4IDAgMCAxLTIuMjY3IDBMNDguMjgzIDU2LjYzMmEuNDA3LjQwNyAwIDAgMC0uNTY3IDBMMzMuMDMgNzEuMDEyYTEuNjI4IDEuNjI4IDAgMCAxLTIuMjY4IDBMMTAuMDcgNTAuNzVhMS41NDcgMS41NDcgMCAwIDEgMC0yLjIybDQuNTktNC40OTRhMS42MjggMS42MjggMCAwIDEgMi4yNjcgMGwxNC42ODcgMTQuMzhjLjE1Ni4xNTMuNDEuMTUzLjU2NyAwbDE0LjY4NS0xNC4zOGExLjYyOCAxLjYyOCAwIDAgMSAyLjI2OCAwbDE0LjY4NyAxNC4zOGMuMTU2LjE1My40MS4xNTMuNTY3IDBsMTQuNjg2LTE0LjM4YTEuNjI4IDEuNjI4IDAgMCAxIDIuMjY4IDBaIg0KICA+PC9wYXRoPg0KPC9zdmc+"

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
