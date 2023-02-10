import { useWeb3Modal, useWeb3ModalTheme } from "@web3modal/react"
import { useAccount } from "wagmi"
import { ReactNode } from "react"

import Button from "../Button"

import classes from "./Layout.module.css"
import { shortenAddress } from "../../utils/shortenAddress"

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useWeb3ModalTheme()
  const { open } = useWeb3Modal()
  const { address } = useAccount()

  console.log(theme)
  setTheme({
    themeMode: "light",
    themeColor: "green",
  })

  return (
    <div className={classes.layout}>
      <img src="/cockpit.jpg" alt="cockpit" className={classes.cockpit} />
      <header className={classes.header}>
        <h1 className={classes.title}>Mech</h1>
        <div className={classes.buttonGroup}>
          <Button onClick={() => open({ route: "SelectNetwork" })} secondary>
            chains
          </Button>
          <Button onClick={open}>
            {!address ? "Connect Wallet" : shortenAddress(address || "")}
          </Button>
        </div>
      </header>
      <main className={classes.main}>{children}</main>
    </div>
  )
}

export default Layout
