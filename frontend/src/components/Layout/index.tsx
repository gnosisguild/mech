import { ReactNode } from "react"

import classes from "./Layout.module.css"
import { Link } from "react-router-dom"
import ChainSelect from "../ChainSelect"
import ConnectButton from "../ConnectButton"
import Search from "../Search"
import { useAccount } from "wagmi"
import Button from "../Button"

interface Props {
  children: ReactNode
}

const Layout: React.FC<Props> = ({ children }) => {
  const { address } = useAccount()
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
            <div className={classes.accountButtons}>
              <ConnectButton />
              {address && (
                <div className={classes.viewAccountContainer}>
                  <Link to={`/account/${address}`}>
                    <Button
                      secondary
                      onClick={() => {}}
                      className={classes.viewAccount}
                    >
                      View account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className={classes.main}>{children}</main>
    </div>
  )
}

export default Layout
