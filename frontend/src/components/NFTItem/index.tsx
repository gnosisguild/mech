import classes from "./NFTItem.module.css"
import { useState } from "react"
import { shortenAddress } from "../../utils/shortenAddress"
import copy from "copy-to-clipboard"
import clsx from "clsx"

import useAccountBalance from "../../hooks/useAccountBalance"
import Spinner from "../Spinner"
import { useDeployMech } from "../../hooks/useDeployMech"

import { MechNFT } from "../../hooks/useNFTsByOwner"
import { calculateMechAddress } from "../../utils/calculateMechAddress"

interface Props {
  nftData: MechNFT
}

const NFTItem: React.FC<Props> = ({ nftData }) => {
  const mechAddress = calculateMechAddress(nftData)
  console.log(nftData)
  const operatorAddress = nftData.nft.owner?.address as string | undefined
  const operatorLabel =
    operatorAddress &&
    (nftData.nft.owner?.ens[0]?.name || shortenAddress(operatorAddress))

  const [imageError, setImageError] = useState(false)

  const {
    isLoading: assetsLoading,
    data: assetsData,
    error: assetsError,
  } = useAccountBalance({ address: mechAddress })

  const { deployed } = useDeployMech(nftData)

  return (
    <div className={classes.itemContainer}>
      <div className={classes.header}>
        <p className={classes.tokenName}>
          {nftData.nft.title || nftData.nft.contractTitle || "..."}
        </p>

        <p className={classes.tokenId} title={nftData.nft.tokenID}>
          {nftData.nft.tokenID}
        </p>
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
              title={mechAddress}
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
              title={operatorAddress}
            >
              <div className={classes.ellipsis}>
                {operatorAddress ? operatorLabel : "\u2014"}
              </div>
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
