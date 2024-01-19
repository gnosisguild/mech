import { ReactNode } from "react"

import classes from "./Layout.module.css"
import { shortenAddress } from "../../utils/shortenAddress"
import { Link } from "react-router-dom"
import ChainSelect from "../ChainSelect"
import ConnectButton from "../ConnectButton"
import Search from "../Search"

interface Props {
  mechAddress?: string
  children: ReactNode
}

const Layout: React.FC<Props> = ({ children, mechAddress }) => {
  return (
    <div className={classes.layout}>
      <img src="/cockpit.png" alt="cockpit" className={classes.cockpit} />
      <header className={classes.headerContainer}>
        <div className={classes.header}>
          <div className={classes.nav}>
            <Link to="/">
              <h1>Mech</h1>
            </Link>
            <Search />
          </div>
          <div className={classes.buttonGroup}>
            <ChainSelect />
            <ConnectButton />
          </div>
        </div>
      </header>
      <main className={classes.main}>{children}</main>
    </div>
  )
}

export default Layout
