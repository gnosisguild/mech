import { Nft } from "@ankr.com/ankr.js"

import classes from "./NFTItem.module.css"
import Button from "../Button"

interface Props {
  nft: Nft
}

const NFTItem: React.FC<Props> = ({ nft }) => {
  console.log(nft)
  return (
    <div className={classes.itemContainer}>
      <div className={classes.header}>
        <p className={classes.tokenName}>{nft.name || "..."}</p>
        {nft.tokenId.length < 5 && (
          <p className={classes.tokenId}>{nft.tokenId || "..."}</p>
        )}
      </div>
      <div className={classes.main}>
        {nft.imageUrl && (
          <img src={nft.imageUrl} alt={nft.name} className={classes.image} />
        )}
        <div className={classes.info}></div>
      </div>
      <Button onClick={() => {}} secondary>
        Deploy Mech
      </Button>
    </div>
  )
}

export default NFTItem
