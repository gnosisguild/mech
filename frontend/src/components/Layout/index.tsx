import { useWeb3Modal, useWeb3ModalTheme } from "@web3modal/react"
import { goerli, useAccount } from "wagmi"
import { ReactNode } from "react"

import { chains } from "../.."
import Button from "../Button"

import classes from "./Layout.module.css"
import { shortenAddress } from "../../utils/shortenAddress"
import Blockie from "../Blockie"
import clsx from "clsx"

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setTheme } = useWeb3ModalTheme()
  const { open, setDefaultChain } = useWeb3Modal()
  const { address } = useAccount()

  setTheme({
    themeMode: "light",
    themeColor: "green",
  })

  setDefaultChain(goerli)

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
