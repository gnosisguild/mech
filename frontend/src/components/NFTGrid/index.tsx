import { useNFTsByOwner } from "ankr-react"

import classes from "./NFTGrid.module.css"
import NFTItem from "../NFTItem"
import Spinner from "../Spinner"

interface Props {
  address: string
}

const NFTGrid: React.FC<Props> = ({ address }) => {
  const { data, isLoading } = useNFTsByOwner({
    walletAddress: "0xc6B69B579b94Cc2E89Ab37c5Dd4EDe3DF05DF04E",
    blockchain: "eth",
  })

  return (
    <div className={classes.container}>
      {isLoading && <Spinner />}
      <ul className={classes.grid}>
        {data?.assets
          .filter((nft) => nft.tokenUrl)
          .filter((nft) => nft.tokenId)
          .map((nft, index) => (
            <li key={`${index}-${nft.contractAddress}`}>
              <NFTItem nft={nft} />
            </li>
          ))}
      </ul>
    </div>
  )
}

export default NFTGrid
