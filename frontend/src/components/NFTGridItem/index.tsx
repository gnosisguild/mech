import clsx from "clsx"
import { Link } from "react-router-dom"

import classes from "./NFTItem.module.css"
import ChainIcon from "../ChainIcon"
import { CHAINS } from "../../chains"
import { MoralisNFT } from "../../types/Token"
import NFTMedia from "../NFTMedia"

interface Props {
  nft: { deployed: boolean } & MoralisNFT
  chainId: number
  showCollectionName?: boolean
}

const NFTGridItem: React.FC<Props> = ({ nft, chainId, showCollectionName }) => {
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
          <p
            className={clsx(
              classes.tokenId,
              !showCollectionName && classes.collectionTokenId
            )}
          >
            {nft.token_id || "..."}
          </p>
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
        <NFTMedia nft={nft} />
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
