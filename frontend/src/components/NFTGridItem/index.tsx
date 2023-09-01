import { TokenBalance } from "@0xsequence/indexer"
import { useState } from "react"
import copy from "copy-to-clipboard"
import clsx from "clsx"
import { Link } from "react-router-dom"

import classes from "./NFTItem.module.css"
import Button from "../Button"
import { shortenAddress } from "../../utils/shortenAddress"
import Spinner from "../Spinner"
import ChainIcon from "../ChainIcon"
import { calculateMechAddress } from "../../utils/calculateMechAddress"
import { CHAINS, ChainId } from "../../chains"
import { useDeployMech } from "../../hooks/useDeployMech"

interface Props {
  tokenBalance: TokenBalance
}

const NFTGridItem: React.FC<Props> = ({ tokenBalance }) => {
  const [imageError, setImageError] = useState(false)

  const chain = CHAINS[tokenBalance.chainId as ChainId]

  const mechAddress = calculateMechAddress(tokenBalance)
  const { deploy, deployPending, deployed } = useDeployMech(tokenBalance)

  const name =
    tokenBalance.tokenMetadata?.name || tokenBalance.contractInfo?.name

  return (
    <div className={classes.itemContainer}>
      <div className={classes.header}>
        <p className={classes.tokenName}>
          <Link
            to={`mechs/${chain.prefix}:${tokenBalance.contractAddress}/${tokenBalance.tokenID}`}
          >
            {name || "..."}
          </Link>
        </p>
        {tokenBalance.tokenID.length < 5 && (
          <p className={classes.tokenId}>{tokenBalance.tokenID || "..."}</p>
        )}
      </div>
      <div className={classes.main}>
        {(imageError || !tokenBalance.tokenMetadata?.image) && (
          <div className={classes.noImage}></div>
        )}
        {!imageError && tokenBalance.tokenMetadata?.image && (
          <div className={classes.imageContainer}>
            <img
              src={tokenBalance.tokenMetadata?.image}
              alt={name}
              className={classes.image}
              onError={() => setImageError(true)}
            />
          </div>
        )}
        <div className={classes.info}>
          <div
            className={clsx(classes.infoItem, classes.address)}
            onClick={() => copy(mechAddress)}
          >
            {shortenAddress(mechAddress)}
          </div>
          <div className={classes.infoItem}>
            <p>Chain:</p>
            <ChainIcon chainId={chain.id} className={classes.chainIcon} />
          </div>
        </div>
      </div>
      {deployed ? (
        <Link
          to={`mechs/${chain.prefix}:${tokenBalance.contractAddress}/${tokenBalance.tokenID}`}
        >
          <Button className={classes.useButton} onClick={() => {}}>
            Use Mech
          </Button>
        </Link>
      ) : (
        <>
          {deployPending ? (
            <div className={classes.spinner}>
              <Spinner />
            </div>
          ) : (
            <Button onClick={deploy} secondary>
              Deploy Mech
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export default NFTGridItem
