import { Web3Button, Web3NetworkSwitch } from "@web3modal/react"
import { ReactNode } from "react"

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div>
      <header>
        <Web3NetworkSwitch />
        <Web3Button />
      </header>
      <main>{children}</main>
    </div>
  )
}

export default Layout
