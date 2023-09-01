import { TokenBalance } from "@0xsequence/indexer"
import classes from "./NFTItem.module.css"
import { useState } from "react"
import { shortenAddress } from "../../utils/shortenAddress"
import copy from "copy-to-clipboard"
import clsx from "clsx"

import useTokenBalances from "../../hooks/useTokenBalances"
import Spinner from "../Spinner"
import { useDeployMech } from "../../hooks/useDeployMech"

import { calculateMechAddress } from "../../utils/calculateMechAddress"
import { formatUnits } from "viem"

interface Props {
  tokenBalance: TokenBalance
}

const NFTItem: React.FC<Props> = ({ tokenBalance }) => {
  const mechAddress = calculateMechAddress(tokenBalance)
  const operatorAddress = tokenBalance.accountAddress

  const [imageError, setImageError] = useState(false)

  const {
    balances: mechBalances,
    isLoading: mechBalancesLoading,
    error: mechBalancesError,
  } = useTokenBalances({
    accountAddress: mechAddress,
    chainId: tokenBalance.chainId,
  })

  const { deployed } = useDeployMech(tokenBalance)
  const name =
    tokenBalance.tokenMetadata?.name || tokenBalance.contractInfo?.name || "..."
  return (
    <div className={classes.itemContainer}>
      <div className={classes.header}>
        <p className={classes.tokenName}>{name}</p>

        <p className={classes.tokenId} title={tokenBalance.tokenID}>
          {tokenBalance.tokenID}
        </p>
      </div>
      <div className={classes.main}>
        {(imageError || !tokenBalance.tokenMetadata?.image) && (
          <div className={classes.noImage}></div>
        )}
        {!imageError && tokenBalance.tokenMetadata?.image && (
          <div className={classes.imageContainer}>
            <img
              src={tokenBalance.tokenMetadata?.image}
              alt={name}
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
                {operatorAddress ? shortenAddress(operatorAddress) : "\u2014"}
              </div>
            </div>
          </li>
          {/* <li>
            <label>Balance</label>
            <div className={clsx(classes.infoItem)}>
              {assetsError || !assetsData
                ? "n/a"
                : `$ ${assetsData.totalBalanceUSD}`}
            </div>
          </li> */}
        </ul>
      </div>
      <label>Assets</label>
      <div
        className={clsx(
          classes.assetsContainer,
          mechBalances.length === 0 && classes.empty
        )}
      >
        {mechBalancesError && <p>Failed to load assets</p>}
        {mechBalancesLoading && <Spinner />}

        {mechBalances.length === 0 && <p>No assets found</p>}
        <ul className={classes.assetList}>
          {mechBalances.map((balance, index) => (
            <li key={index} className={classes.asset}>
              <div className={classes.name}>{balance.contractInfo?.name}</div>
              <div className={classes.value}>
                <p>
                  {formatUnits(
                    BigInt(balance.balance),
                    balance.contractInfo?.decimals || 0
                  )}
                </p>
                <p>{balance.contractInfo?.symbol}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default NFTItem
