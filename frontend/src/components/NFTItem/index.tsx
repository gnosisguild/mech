import classes from "./NFTItem.module.css"
import { useState } from "react"
import { shortenAddress } from "../../utils/shortenAddress"
import useTokenUrl from "../../hooks/useTokenUrl"
import copy from "copy-to-clipboard"
import clsx from "clsx"
import { MechGetNFTMetadataReply } from "../../hooks/useNFT"
import useAccountBalance from "../../hooks/useAccountBalance"
import Spinner from "../Spinner"
import {
  useChainId,
  usePrepareContractWrite,
  useProvider,
  useSigner,
} from "wagmi"
import { deployERC721Mech, makeERC721MechDeployTransaction } from "mech-sdk"
import {
  JsonRpcProvider,
  JsonRpcSigner,
  Web3Provider,
} from "@ethersproject/providers"

interface Props {
  contractAddress: string
  tokenId: string
  nft: MechGetNFTMetadataReply
  mechAddress: string
  operatorAddress?: string
  deployed?: boolean
}

const NFTItem: React.FC<Props> = ({
  contractAddress,
  tokenId,
  nft,
  mechAddress,
  operatorAddress,
  deployed,
}) => {
  const [imageError, setImageError] = useState(false)
  const { isLoading, data, error } = useTokenUrl(
    nft.attributes && !nft.attributes.imageUrl
      ? nft.attributes.tokenUrl
      : undefined
  )
  const {
    isLoading: assetsLoading,
    data: assetsData,
    error: assetsError,
  } = useAccountBalance({ address: mechAddress })

  const { data: signer } = useSigner()
  const chainId = useChainId()

  const deploy = async () => {
    if (!signer) return
    // makeERC721MechDeployTransaction(contractAddress, tokenId, provider)
  }

  usePrepareContractWrite()

  console.log("assetsData", assetsData, assetsError)
  return (
    <div className={classes.itemContainer}>
      <div className={classes.header}>
        <p className={classes.tokenName}>
          {nft.attributes?.name || nft.metadata?.collectionName || "..."}
        </p>
        {nft.metadata && nft.metadata.tokenId.length < 5 && (
          <p className={classes.tokenId}>{nft.metadata.tokenId || "..."}</p>
        )}
      </div>
      <div className={classes.main}>
        {(error || imageError || isLoading) && (
          <div className={classes.noImage}></div>
        )}
        {!isLoading && !error && !imageError && (
          <div className={classes.imageContainer}>
            <img
              src={data ? data.image : nft.attributes?.imageUrl}
              alt={nft.attributes?.name}
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
            {!deployed && <button onClick={deploy}>deploy</button>}
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
              className={clsx(classes.infoItem, classes.address)}
              onClick={() => copy(operatorAddress || "")}
            >
              {shortenAddress(operatorAddress || "")}
            </div>
          </li>
          <li>
            <label>Balance</label>
            <div className={clsx(classes.infoItem)}>
              {assetsError || !assetsData
                ? "n/a"
                : `$ ${assetsData.totalBalanceUsd}`}
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
            <ul>
              {assetsData.assets.map((asset, index) => (
                <li key={index}>
                  <div>
                    <p>{asset.thumbnail}</p>
                    <p>{asset.balance}</p>
                    <p>{asset.tokenSymbol}</p>
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
