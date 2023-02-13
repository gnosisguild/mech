import { useWeb3Modal, useWeb3ModalTheme } from "@web3modal/react"
import { useAccount } from "wagmi"
import { ReactNode } from "react"

import Button from "../Button"

import classes from "./Layout.module.css"
import { shortenAddress } from "../../utils/shortenAddress"
import Blockie from "../Blockie"
import clsx from "clsx"

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
          <Button
            onClick={() => open({ route: "SelectNetwork" })}
            secondary
            className={classes.button}
          >
            chains
          </Button>
          <Button
            onClick={open}
            className={clsx(classes.button, address && classes.connectedButton)}
            secondary={!!address}
          >
            {!address ? (
              <p>Connect Wallet</p>
            ) : (
              <div className={classes.connectedAccount}>
                <Blockie className={classes.blockie} address={address} />
                <p>{shortenAddress(address || "")}</p>
              </div>
            )}
          </Button>
        </div>
      </header>
      <main className={classes.main}>{children}</main>
    </div>
  )
}

export default Layout
