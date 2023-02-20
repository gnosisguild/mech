import React, { useState } from "react"
import useWalletConnect from "../../useWalletConnect"
import Spinner from "../Spinner"

import classes from "./Connect.module.css"
import Button from "../Button"

const MechConnect: React.FC = () => {
  const { pair, sessions } = useWalletConnect()
  const [loading, setLoading] = useState(false)
  const [uri, setUri] = useState("")

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
          Copy and paste the Wallet Connect link here to connect this Mech to an
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

      <h4>Connections</h4>
      <ul className={classes.sessions}>
        {sessions.map((session, index) => (
          <li key={`session-${index}`}>
            <p>Session</p>
            <Button secondary onClick={() => {}} className={classes.disconnect}>
              ✕
            </Button>
          </li>
        ))}
      </ul>
      <Button secondary onClick={() => {}} className={classes.disconnectAll}>
        Disconnect All
      </Button>
    </div>
  )
}
export default MechConnect
