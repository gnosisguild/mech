import NFTGridItem from "../NFTGridItem"
import Spinner from "../Spinner"

import classes from "./NFTGrid.module.css"
import { useChainId } from "wagmi"
import { useDeployedMechs } from "../../hooks/useDeployMech"
import { calculateMechAddress } from "../../utils/calculateMechAddress"
import useTokenBalances from "../../hooks/useTokenBalances"
import { getNFTContext, getNFTContexts } from "../../utils/getNFTContext"
import { MoralisNFT } from "../../types/Token"
import useCollection from "../../hooks/useCollection"
import Button from "../Button"

interface Props {
  address: string
}

export const AccountNftGrid: React.FC<Props> = ({ address }) => {
  const chainId = useChainId()
  const { data, isLoading } = useTokenBalances({
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

  if (nfts.length === 0) {
    return (
      <div className={classes.noNfts}>
        <p>No NFTs found</p>
      </div>
    )
  }

  return (
    <ul className={classes.grid}>
      {nfts.map((nft, index) => (
        <li key={`${index}-${nft.token_address}`}>
          <NFTGridItem chainId={chainId} nft={nft} showCollectionName />
        </li>
      ))}
    </ul>
  )
}

export const CollectionNftGrid: React.FC<Props> = ({ address }) => {
  const chainId = useChainId()
  const { data, isLoading, fetchNextPage, fetchPreviousPage } = useCollection({
    tokenAddress: address,
    chainId,
  })
  const currentPage = data?.pages[0]
  const nftBalances =
    (currentPage?.result as MoralisNFT[]) || ([] as MoralisNFT[])

  const previousPageAvailable = (data?.pageParams[0] as string[]).length > 0
  const nextPageAvailable = currentPage?.cursor && currentPage.cursor.length > 0

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
    <>
      <ul className={classes.grid}>
        {nfts.map((nft, index) => (
          <li key={`${index}-${nft.token_address}`}>
            <NFTGridItem chainId={chainId} nft={nft} />
          </li>
        ))}
      </ul>
      <div className={classes.pageButtons}>
        <Button
          secondary
          onClick={() => fetchPreviousPage()}
          disabled={!previousPageAvailable}
        >
          Previous
        </Button>

        <Button
          secondary
          onClick={() => fetchNextPage()}
          disabled={!nextPageAvailable}
        >
          Next
        </Button>
      </div>
    </>
  )
}
