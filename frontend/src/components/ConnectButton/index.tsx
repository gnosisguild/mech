import { ConnectButton as RKConnectButton } from "@rainbow-me/rainbowkit"
import clsx from "clsx"
import Button from "../Button"
import { shortenAddress } from "../../utils/shortenAddress"
import Blockie from "../Blockie"
import classes from "./ConnectButton.module.css"

export const ConnectButton = () => {
  return (
    <RKConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    secondary
                    className={clsx(classes.button)}
                  >
                    Connect Wallet
                  </Button>
                )
              }

              return (
                <Button
                  onClick={openAccountModal}
                  secondary
                  className={clsx(classes.button, classes.connectedButton)}
                >
                  <Blockie
                    address={account.address}
                    className={classes.blockie}
                  />
                  <p>{shortenAddress(account.address)}</p>
                </Button>
              )
            })()}
          </div>
        )
      }}
    </RKConnectButton.Custom>
  )
}

export default ConnectButton
