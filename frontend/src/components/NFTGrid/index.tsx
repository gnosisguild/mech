import { ContractType, TokenBalance } from "@0xsequence/indexer"
import NFTGridItem from "../NFTGridItem"
import Spinner from "../Spinner"

import classes from "./NFTGrid.module.css"
import clsx from "clsx"
import { useChainId } from "wagmi"
import { useDeployedMechs } from "../../hooks/useDeployMech"
import { calculateMechAddress } from "../../utils/calculateMechAddress"
import useTokenBalances from "../../hooks/useTokenBalances"

interface Props {
  address: string
}

const NFTGrid: React.FC<Props> = ({ address }) => {
  const chainId = useChainId()

  const { balances, isLoading } = useTokenBalances({
    accountAddress: address,
    chainId,
  })

  const nftBalances = balances.filter(
    (balance) =>
      balance.contractType === ContractType.ERC721 ||
      balance.contractType === ContractType.ERC1155
  )

  const deployedMechs = useDeployedMechs(nftBalances)

  const isDeployed = (nft: TokenBalance) =>
    deployedMechs.some(
      (mech) =>
        mech.chainId === chainId &&
        mech.address.toLowerCase() === calculateMechAddress(nft).toLowerCase()
    )

  const deployed = nftBalances.filter(isDeployed)
  const undeployed = nftBalances.filter((nft) => !isDeployed(nft))

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
            <NFTGridItem tokenBalance={nft} />
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
              <NFTGridItem tokenBalance={nft} />
            </li>
          ))}
        </ul>
      )}
      {isLoading && <Spinner />}
    </div>
  )
}

export default NFTGrid
