import classes from "./NFTItem.module.css"
import { shortenAddress } from "../../utils/shortenAddress"
import copy from "copy-to-clipboard"
import clsx from "clsx"

import useTokenBalances from "../../hooks/useTokenBalances"
import Loading from "../Loading"
import { useDeployMech } from "../../hooks/useDeployMech"

import { calculateMechAddress } from "../../utils/calculateMechAddress"
import { formatUnits } from "viem"
import { MoralisNFT } from "../../types/Token"
import { getNFTContext } from "../../utils/getNFTContext"
import { AccountNftGrid } from "../NFTGrid"
import NFTMedia from "../NFTMedia"
import { Link } from "react-router-dom"

interface Props {
  nft: MoralisNFT
  chainId: number
}

const NFTItem: React.FC<Props> = ({ nft, chainId }) => {
  const mechAddress = calculateMechAddress(getNFTContext(nft), chainId)
  const operatorAddress = nft.owner_of

  const {
    data,
    isLoading: mechBalancesLoading,
    error: mechBalancesError,
  } = useTokenBalances({
    accountAddress: mechAddress,
    chainId,
  })

  const mechNativeBalance = data ? data.native : null
  const mechErc20Balances = data ? data.erc20s : []
  const { deployed } = useDeployMech(getNFTContext(nft), chainId)
  const metadata = JSON.parse(nft.metadata || "{}")
  const name = nft.name || metadata?.name || "..."
  return (
    <div className={classes.itemContainer}>
      <div className={classes.header}>
        <Link
          to={`/collection/${nft.token_address}`}
          className={classes.tokenName}
        >
          <p>{name}</p>
        </Link>

        <p className={classes.tokenId} title={nft.token_id}>
          {nft.token_id}
        </p>
      </div>
      <div className={classes.main}>
        <NFTMedia nft={nft} />

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
              {shortenAddress(mechAddress, 6)}
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
                {operatorAddress
                  ? shortenAddress(operatorAddress, 6)
                  : "\u2014"}
              </div>
            </div>
          </li>
        </ul>
      </div>
      <label>Inventory</label>
      <div className={clsx(classes.assetsContainer)}>
        {mechBalancesError && <p>Failed to load assets</p>}
        {mechBalancesLoading && <Loading />}
        <ul className={classes.assetList}>
          {!mechBalancesLoading && !mechBalancesError && mechNativeBalance && (
            <li className={classes.asset}>
              <div>{mechNativeBalance.name}</div>
              <div className={classes.value}>
                <p>
                  {formatUnits(
                    BigInt(mechNativeBalance.balance),
                    mechNativeBalance.decimals || 0
                  )}
                </p>
                <p>{mechNativeBalance.symbol}</p>
              </div>
            </li>
          )}
          {mechErc20Balances.map((balance, index) => (
            <li key={index} className={classes.asset}>
              <div className={classes.assetName}>
                <img src={balance.logo} alt={`logo for ${balance.name}`} />
                <div>{balance.name}</div>
              </div>
              <div className={classes.value}>
                <p>
                  {formatUnits(BigInt(balance.balance), balance.decimals || 0)}
                </p>
                <p>{balance.symbol}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <label>NFTs</label>
      <AccountNftGrid address={mechAddress} />
    </div>
  )
}

export default NFTItem
