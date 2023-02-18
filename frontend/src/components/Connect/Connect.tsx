import React, { useState } from "react"
import useWalletConnect from "../../useWalletConnect"
import Spinner from "../Spinner"

const MechConnect: React.FC = () => {
  const { pair } = useWalletConnect()
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
    <div>
      <h3>Connect</h3>
      <p>
        Visit an app and select WalletConnect. Click the "Copy to clipboard"
        button and paste here:
      </p>
      <input type="text" autoFocus value={uri} onChange={handleChange} />
      {loading && <Spinner />}

      <h3>Connected sites</h3>
      <ul>
        <li>
          <button>disconnect</button>
        </li>
      </ul>
      <button>disconnect all</button>
    </div>
  )
}
export default MechConnect
