import { useEffect, useState } from "react"

import useNFTsByOwner, { MechNFT } from "../../hooks/useNFTsByOwner"
import NFTGridItem from "../NFTGridItem"
import Spinner from "../Spinner"
import Button from "../Button"

import classes from "./NFTGrid.module.css"
import clsx from "clsx"

interface Props {
  address: string
}

const NFTGrid: React.FC<Props> = ({ address }) => {
  const [pageToken, setPageToken] = useState<string | undefined>(undefined)

  const { data, isLoading } = useNFTsByOwner({
    walletAddress: address,
    blockchain: "eth_goerli",
    pageToken,
  })

  const [nftData, setNftData] = useState<MechNFT[]>([])

  useEffect(() => {
    setNftData((nftData) => {
      const ids = new Set(
        nftData.map((nft) => nft.tokenId + nft.contractAddress)
      )

      // merge and dedupe
      return [
        ...nftData,
        ...data?.assets.filter(
          (nft) => !ids.has(nft.tokenId + nft.contractAddress)
        ),
      ]
    })
  }, [data])

  return (
    <div className={classes.container}>
      <div className={classes.categoryContainer}>
        <div className={classes.category}>
          <div className={classes.indicator}></div>
          <h2>Deployed</h2>
        </div>
      </div>
      <ul className={classes.grid}>
        {nftData
          .filter((nft) => nft.hasMech)
          .filter((nft) => nft.tokenUrl && nft.tokenId)
          .map((nft, index) => (
            <li key={`${index}-${nft.contractAddress}`}>
              <NFTGridItem nft={nft} />
            </li>
          ))}
      </ul>
      <div className={classes.categoryContainer}>
        <div className={classes.category}>
          <div className={clsx(classes.indicator, classes.undeployed)}></div>
          <h2>Undeployed</h2>
        </div>
      </div>
      <ul className={classes.grid}>
        {nftData
          .filter((nft) => !nft.hasMech)
          .filter((nft) => nft.tokenUrl && nft.tokenId)
          .map((nft, index) => (
            <li key={`${index}-${nft.contractAddress}`}>
              <NFTGridItem nft={nft} />
            </li>
          ))}
      </ul>
      {isLoading ? (
        <Spinner />
      ) : (
        <Button
          onClick={() => {
            console.log("set page token")
            setPageToken(data?.nextPageToken)
          }}
          secondary
        >
          Load more
        </Button>
      )}
    </div>
  )
}

export default NFTGrid
