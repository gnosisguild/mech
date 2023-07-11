import { useWeb3Modal } from "@web3modal/react"
import Button from "../Button"

import classes from "./ChainSelect.module.css"
import { Chain, useNetwork } from "wagmi"
import { Suspense, lazy, useEffect, useState } from "react"
import { DEFAULT_CHAIN } from "../../chains"
const ChainIcon = lazy(() => import("../ChainIcon"))

const ChainSelect = () => {
  const [selectedChain, setSelectedChain] = useState<Chain>(DEFAULT_CHAIN)
  const { open } = useWeb3Modal()
  const { chain } = useNetwork()

  useEffect(() => {
    if (chain) {
      setSelectedChain(chain)
    }
  }, [chain])

  return (
    <div>
      <Button
        onClick={() => open({ route: "SelectNetwork" })}
        secondary
        className={classes.button}
      >
        <Suspense fallback={<div />}>
          <ChainIcon chainId={selectedChain.id} className={classes.icon} />
        </Suspense>
      </Button>
    </div>
  )
}

export default ChainSelect
