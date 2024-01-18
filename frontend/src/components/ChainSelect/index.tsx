import { useChainId, useSwitchNetwork } from "wagmi"
import { Suspense, lazy, useState } from "react"
import clsx from "clsx"
import Button from "../Button"
import useClickAway from "../../hooks/useClickAway"
import classes from "./ChainSelect.module.css"
import { CHAINS } from "../../chains"
const ChainIcon = lazy(() => import("../ChainIcon"))

const ChainSelect = () => {
  const [showDropdown, setShowDropdown] = useState(false)
  const { switchNetwork } = useSwitchNetwork()
  const currentChainId = useChainId()

  const ref = useClickAway(() => {
    setShowDropdown(false)
  })

  return (
    <div className={classes.container} ref={ref}>
      <Button
        onClick={() => setShowDropdown(showDropdown ? false : true)}
        secondary
        className={classes.button}
      >
        <Suspense fallback={<div />}>
          <ChainIcon chainId={currentChainId} className={classes.icon} />
        </Suspense>

        <svg
          viewBox="0 0 10 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={clsx(classes.chevronDown, showDropdown && classes.up)}
        >
          <path d="M1 1L5 5L9 1" stroke="inherit" strokeWidth="2" />
        </svg>
      </Button>
      {showDropdown && (
        <div className={classes.dropdown}>
          <ul>
            {Object.keys(CHAINS).map((chainId) => {
              const chain = CHAINS[parseInt(chainId)]
              return (
                <li key={chainId}>
                  <button
                    onClick={() => {
                      switchNetwork?.(chain.id)
                      setShowDropdown(false)
                    }}
                    className={classes.dropdownItem}
                  >
                    <div className={classes.chain}>
                      <Suspense fallback={<div />}>
                        <ChainIcon
                          chainId={chain.id}
                          className={classes.dropdownIcon}
                        />
                      </Suspense>
                      <p>{chain.name}</p>
                    </div>

                    {currentChainId && chain.id === currentChainId ? (
                      <div className={classes.checkmark}>
                        <svg
                          width="12"
                          height="9"
                          viewBox="0 0 12 9"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 4.5L4.5 8L11 1"
                            stroke="inherit"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ChainSelect
