import { Nft } from "@ankr.com/ankr.js"
import { calculateERC721MechAddress } from "mech"

import classes from "./NFTItem.module.css"
import Button from "../Button"
import { useState } from "react"
import { shortenAddress } from "../../utils/shortenAddress"
import useTokenUrl from "../../hooks/useTokenUrl"

interface Props {
  nft: Nft
}

const NFTItem: React.FC<Props> = ({ nft }) => {
  const [imageError, setImageError] = useState(false)
  const needTokenUrl = !nft.imageUrl
  const { isLoading, data, error } = useTokenUrl(
    needTokenUrl ? nft.tokenUrl : undefined
  )
  return (
    <div className={classes.itemContainer}>
      <div className={classes.header}>
        <p className={classes.tokenName}>
          {nft.name || nft.collectionName || "..."}
        </p>
        {nft.tokenId.length < 5 && (
          <p className={classes.tokenId}>{nft.tokenId || "..."}</p>
        )}
      </div>
      <div className={classes.main}>
        {(error || imageError || isLoading) && (
          <div className={classes.noImage}></div>
        )}
        {!isLoading && !error && !imageError && (
          <div className={classes.imageContainer}>
            <img
              src={data ? data.image : nft.imageUrl}
              alt={nft.name}
              className={classes.image}
              onError={() => setImageError(true)}
            />
          </div>
        )}
        <div className={classes.info}>
          <div className={classes.infoItem}>
            {shortenAddress(
              calculateERC721MechAddress(nft.contractAddress, nft.tokenId)
            )}
          </div>
        </div>
      </div>
      <Button onClick={() => {}} secondary>
        Deploy Mech
      </Button>
    </div>
  )
}

export default NFTItem
