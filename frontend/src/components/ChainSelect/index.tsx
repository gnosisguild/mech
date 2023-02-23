import { useWeb3Modal } from "@web3modal/react"
import Button from "../Button"

import classes from "./ChainSelect.module.css"
import { Chain, goerli, useNetwork } from "wagmi"
import { Suspense, lazy, useEffect, useState } from "react"
const ChainIcon = lazy(() => import("../ChainIcon"))

const ChainSelect = () => {
  const [selectedChain, setSelectedChain] = useState<Chain>(goerli)
  const { open, setDefaultChain } = useWeb3Modal()
  const { chain } = useNetwork()

  setDefaultChain(goerli)

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
