import { useWeb3Modal, useWeb3ModalTheme } from "@web3modal/react"
import { useAccount } from "wagmi"
import { ReactNode } from "react"

import Button from "../Button"

import classes from "./Layout.module.css"
import { shortenAddress } from "../../utils/shortenAddress"
import Blockie from "../Blockie"
import clsx from "clsx"
import { Link } from "react-router-dom"
import ChainSelect from "../ChainSelect"

interface Props {
  mechAddress?: string
  children: ReactNode
}

const Layout: React.FC<Props> = ({ children, mechAddress }) => {
  const { setTheme } = useWeb3ModalTheme()
  const { open } = useWeb3Modal()
  const { address } = useAccount()

  setTheme({
    themeMode: "light",
    themeColor: "green",
  })

  return (
    <div className={classes.layout}>
      <img src="/cockpit.jpg" alt="cockpit" className={classes.cockpit} />
      <header className={classes.header}>
        <div className={classes.nav}>
          <Link to="/">
            <h1>Mech</h1>
          </Link>
          {mechAddress && (
            <>
              <h1>/</h1>
              <h1>{shortenAddress(mechAddress)}</h1>
            </>
          )}
        </div>
        <div className={classes.buttonGroup}>
          <ChainSelect />
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
