import classes from "./NFTItem.module.css"
import { useState } from "react"
import { shortenAddress } from "../../utils/shortenAddress"
import copy from "copy-to-clipboard"
import clsx from "clsx"

import useAccountBalance from "../../hooks/useAccountBalance"
import Spinner from "../Spinner"
import { useDeployMech } from "../../hooks/useDeployMech"
import { calculateERC721MechAddress } from "mech-sdk"
import { MechNFT } from "../../hooks/useNFTsByOwner"

interface Props {
  token: string
  tokenId: string
  nftData: MechNFT
  operatorAddress?: string
}

const NFTItem: React.FC<Props> = ({
  token,
  tokenId,
  nftData,
  operatorAddress,
}) => {
  const mechAddress = calculateERC721MechAddress(token, tokenId)

  const [imageError, setImageError] = useState(false)

  const {
    isLoading: assetsLoading,
    data: assetsData,
    error: assetsError,
  } = useAccountBalance({ address: mechAddress })

  const { deployed } = useDeployMech(token, tokenId)

  return (
    <div className={classes.itemContainer}>
      <div className={classes.header}>
        <p className={classes.tokenName}>
          {nftData.nft.title || nftData.nft.contractTitle || "..."}
        </p>
        {nftData.nft.tokenID.length < 5 && (
          <p className={classes.tokenId}>{nftData.nft.tokenID || "..."}</p>
        )}
      </div>
      <div className={classes.main}>
        {(imageError || !nftData.nft.previews) && (
          <div className={classes.noImage}></div>
        )}
        {!imageError && nftData.nft.previews && (
          <div className={classes.imageContainer}>
            <img
              src={nftData.nft.previews[0].URI}
              alt={nftData.nft.contractTitle}
              className={classes.image}
              onError={() => setImageError(true)}
            />
          </div>
        )}

        <ul className={classes.info}>
          <li>
            <label>Status</label>
            <div className={classes.infoItem}>
              <div
                className={clsx(
                  classes.indicator,
                  deployed && classes.deployed
                )}
              />
              {deployed ? "Deployed" : "Not Deployed"}
            </div>
          </li>
          <li>
            <label>Mech</label>
            <div
              className={clsx(classes.infoItem, classes.address)}
              onClick={() => copy(mechAddress)}
            >
              {shortenAddress(mechAddress)}
            </div>
          </li>
          <li>
            <label>Operator</label>
            <div
              className={clsx(classes.infoItem, {
                [classes.address]: !!operatorAddress,
              })}
              onClick={
                operatorAddress ? () => copy(operatorAddress) : undefined
              }
            >
              {operatorAddress ? shortenAddress(operatorAddress) : "\u2014"}
            </div>
          </li>
          <li>
            <label>Balance</label>
            <div className={clsx(classes.infoItem)}>
              {assetsError || !assetsData
                ? "n/a"
                : `$ ${assetsData.totalBalanceUSD}`}
            </div>
          </li>
        </ul>
      </div>
      <label>Assets</label>
      <div
        className={clsx(
          classes.assetsContainer,
          assetsData && assetsData.assets.length === 0 && classes.empty
        )}
      >
        {assetsError && <p>Failed to load assets</p>}
        {assetsLoading && <Spinner />}
        {assetsData && (
          <>
            {assetsData.assets.length === 0 && <p>No assets found</p>}
            <ul className={classes.assetList}>
              {assetsData.assets.map((asset, index) => (
                <li key={index} className={classes.asset}>
                  <div className={classes.name}>{asset.name}</div>
                  <div className={classes.value}>
                    <p>{asset.pretty}</p>
                    <p>{asset.symbol}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export default NFTItem
