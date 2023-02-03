import React from "react"

const CardConnect: React.FC = () => {
  const handlePaste = (ev: React.ClipboardEvent<HTMLInputElement>) =>
    console.log((ev.target as any).value)
  return (
    <div>
      <h3>Connect</h3>
      <p>
        Visit and app and select WalletConnect. Click the "Copy to clipboard"
        button and paste here:
      </p>
      <input type="text" autoFocus onPaste={handlePaste} />

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
export default CardConnect
