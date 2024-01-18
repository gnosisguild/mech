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
import { CHAINS } from "../../chains"
import { useDeployMech } from "../../hooks/useDeployMech"
import { MoralisNFT } from "../../types/Token"
import { getNFTContext } from "../../utils/getNFTContext"

interface Props {
  nft: MoralisNFT
  chainId: number
}

const NFTGridItem: React.FC<Props> = ({ nft, chainId }) => {
  const [imageError, setImageError] = useState(false)

  const chain = CHAINS[chainId]

  const mechAddress = calculateMechAddress(getNFTContext(nft), chainId)
  const { deploy, deployPending, deployed } = useDeployMech(
    getNFTContext(nft),
    chainId
  )

  const name = nft.name || nft.metadata?.name

  return (
    <div className={classes.itemContainer}>
      <div className={classes.header}>
        <p className={classes.tokenName}>
          <Link
            to={`mechs/${chain.prefix}:${nft.token_address}/${nft.token_id}`}
          >
            {name || "..."}
          </Link>
        </p>
        {nft.token_id.length < 5 && (
          <p className={classes.tokenId}>{nft.token_id || "..."}</p>
        )}
      </div>
      <div className={classes.main}>
        {(imageError || !nft.metadata?.image) && (
          <div className={classes.noImage}></div>
        )}
        {!imageError && nft.metadata?.image && (
          <div className={classes.imageContainer}>
            <img
              src={nft.metadata?.image}
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
        <Link to={`mechs/${chain.prefix}:${nft.token_address}/${nft.token_id}`}>
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
