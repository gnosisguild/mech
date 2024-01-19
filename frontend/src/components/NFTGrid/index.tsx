import NFTGridItem from "../NFTGridItem"
import Spinner from "../Spinner"

import classes from "./NFTGrid.module.css"
import clsx from "clsx"
import { useChainId } from "wagmi"
import { useDeployedMechs } from "../../hooks/useDeployMech"
import { calculateMechAddress } from "../../utils/calculateMechAddress"
import useTokenBalances from "../../hooks/useTokenBalances"
import { getNFTContext, getNFTContexts } from "../../utils/getNFTContext"
import { MoralisNFT } from "../../types/Token"

interface Props {
  address: string
}

const NFTGrid: React.FC<Props> = ({ address }) => {
  const chainId = useChainId()
  const { data, isLoading, error } = useTokenBalances({
    accountAddress: address,
    chainId,
  })
  const nftBalances = data?.nfts || []

  const deployedMechs = useDeployedMechs(getNFTContexts(nftBalances), chainId)

  const isDeployed = (nft: MoralisNFT) =>
    deployedMechs.some(
      (mech) =>
        mech.chainId === chainId &&
        mech.address.toLowerCase() ===
          calculateMechAddress(getNFTContext(nft), chainId).toLowerCase()
    )

  const nfts = nftBalances.map((nft) => ({ ...nft, deployed: isDeployed(nft) }))

  if (isLoading) return <Spinner />

  return (
    <ul className={classes.grid}>
      {nfts.map((nft, index) => (
        <li key={`${index}-${nft.token_address}`}>
          <NFTGridItem chainId={chainId} nft={nft} />
        </li>
      ))}
    </ul>
  )
}

export default NFTGrid
