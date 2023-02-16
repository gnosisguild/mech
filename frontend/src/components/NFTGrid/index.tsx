import { useEffect, useState } from "react"
import { Nft } from "@ankr.com/ankr.js"

import useNFTsByOwner from "../../hooks/useNFTsByOwner"
import NFTItem from "../NFTItem"
import Spinner from "../Spinner"
import Button from "../Button"

import classes from "./NFTGrid.module.css"

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

  const [nftData, setNftData] = useState<Nft[]>([])

  useEffect(() => {
    console.log("data changed", data?.nextPageToken)
    if (nftData.length === 0) {
      setNftData(data?.assets || [])
      return
    }
    const ids = new Set(nftData.map((nft) => nft.tokenId + nft.contractAddress))
    const mergedDeduped = [
      ...nftData,
      ...data?.assets.filter(
        (nft) => !ids.has(nft.tokenId + nft.contractAddress)
      ),
    ]
    setNftData(mergedDeduped)
  }, [data])

  return (
    <div className={classes.container}>
      <ul className={classes.grid}>
        {nftData
          .filter((nft) => nft.tokenUrl)
          .filter((nft) => nft.tokenId)
          .map((nft, index) => (
            <li key={`${index}-${nft.contractAddress}`}>
              <NFTItem nft={nft} />
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
