import { useState } from "react"
import clsx from "clsx"
import { Link } from "react-router-dom"

import classes from "./NFTItem.module.css"
import ChainIcon from "../ChainIcon"
import { CHAINS } from "../../chains"
import { MoralisNFT } from "../../types/Token"

interface Props {
  nft: { deployed: boolean } & MoralisNFT
  chainId: number
  showCollectionName?: boolean
}

const NFTGridItem: React.FC<Props> = ({ nft, chainId, showCollectionName }) => {
  const [imageError, setImageError] = useState(false)

  const chain = CHAINS[chainId]

  const metadata = JSON.parse(nft.metadata || "{}")
  const name = nft.name || metadata.name
  return (
    <Link
      to={`/mech/${chain.prefix}:${nft.token_address}/${nft.token_id}`}
      className={classes.linkContainer}
    >
      <div className={classes.header}>
        {showCollectionName && (
          <p className={classes.tokenName}>{name || "..."}</p>
        )}
        {nft.token_id.length < 7 && (
          <p className={classes.tokenId}>{nft.token_id || "..."}</p>
        )}
      </div>
      <div className={classes.footer}>
        <div className={classes.deployStatus}>
          <div
            className={clsx(
              classes.indicator,
              !nft.deployed && classes.undeployed
            )}
          ></div>
          <p>{nft.deployed ? "Deployed" : "Not Deployed"}</p>
        </div>
        <div className={classes.chain}>
          <ChainIcon chainId={chainId} />
        </div>
      </div>
      <div className={classes.main}>
        {(imageError || !metadata.image) && (
          <div className={classes.noImage}></div>
        )}
        {!imageError && metadata.image && (
          <div className={classes.imageContainer}>
            <img
              src={metadata.image}
              alt={name}
              className={classes.image}
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </div>
      <div className={classes.visit}>
        <h3>⬈⬈⬈⬈⬈⬈⬈⬈⬈</h3>
        <h3>View Mech</h3>
        <h3>⬈⬈⬈⬈⬈⬈⬈⬈⬈</h3>
      </div>
    </Link>
  )
}

export default NFTGridItem
