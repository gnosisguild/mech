import { useEffect, useState } from "react"

import useNFTsByOwner, { MechNFT } from "../../hooks/useNFTsByOwner"
import NFTGridItem from "../NFTGridItem"
import Spinner from "../Spinner"
import Button from "../Button"

import classes from "./NFTGrid.module.css"
import clsx from "clsx"
import { useChainId } from "wagmi"
import { useDeployedMechs } from "../../hooks/useDeployMech"
import { calculateMechAddress } from "../../utils/calculateMechAddress"

interface Props {
  address: string
}

const NFTGrid: React.FC<Props> = ({ address }) => {
  const [pageToken, setPageToken] = useState<string | undefined>(undefined)

  const chainId = useChainId()

  const { data, isLoading } = useNFTsByOwner({
    walletAddress: address,
    chainId,
    pageToken,
  })

  const [nftData, setNftData] = useState<MechNFT[]>([])

  useEffect(() => {
    setNftData((nftData) => {
      if (nftData.length === 0) {
        return data?.assets || []
      }
      const ids = new Set(
        nftData.map((nft) => nft.nft.tokenID + nft.contractAddress)
      )

      // merge and dedupe
      return [
        ...nftData,
        ...data?.assets.filter(
          (nft) => !ids.has(nft.nft.tokenID + nft.contractAddress)
        ),
      ]
    })
  }, [data])

  const deployedMechs = useDeployedMechs(nftData)

  const isDeployed = (nft: MechNFT) =>
    deployedMechs.some(
      (mech) =>
        mech.chainId === chainId &&
        mech.address.toLowerCase() === calculateMechAddress(nft).toLowerCase()
    )

  const deployed = nftData.filter(isDeployed)
  const undeployed = nftData.filter((nft) => !isDeployed(nft))

  return (
    <div className={classes.container}>
      <div className={classes.categoryContainer}>
        <div className={classes.category}>
          <div className={classes.indicator}></div>
          <h2>Deployed</h2>
        </div>
      </div>
      {deployed.length === 0 && (
        <div className={classes.noDeployed}>
          <p>No mechs deployed</p>
        </div>
      )}
      <ul className={classes.grid}>
        {deployed.map((nft, index) => (
          <li key={`${index}-${nft.contractAddress}`}>
            <NFTGridItem nftData={nft} />
          </li>
        ))}
      </ul>
      <div className={classes.categoryContainer}>
        <div className={classes.category}>
          <div className={clsx(classes.indicator, classes.undeployed)}></div>
          <h2>Undeployed</h2>
        </div>
      </div>
      {undeployed.length > 0 && (
        <ul className={classes.grid}>
          {undeployed.map((nft, index) => (
            <li key={`${index}-${nft.contractAddress}`}>
              <NFTGridItem nftData={nft} />
            </li>
          ))}
        </ul>
      )}
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
