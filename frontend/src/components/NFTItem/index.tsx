import { calculateERC721MechAddress, deployERC721Mech } from "mech"

import classes from "./NFTItem.module.css"
import Button from "../Button"
import { useState } from "react"
import { shortenAddress } from "../../utils/shortenAddress"
import useTokenUrl from "../../hooks/useTokenUrl"
import { useSigner } from "wagmi"
import { JsonRpcSigner } from "@ethersproject/providers"
import Spinner from "../Spinner"
import copy from "copy-to-clipboard"
import clsx from "clsx"
import { MechNFT } from "../../hooks/useNFTsByOwner"

interface Props {
  nft: MechNFT
}

const NFTItem: React.FC<Props> = ({ nft }) => {
  const [imageError, setImageError] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const needTokenUrl = !nft.imageUrl
  const { isLoading, data, error } = useTokenUrl(
    needTokenUrl ? nft.tokenUrl : undefined
  )
  const { data: signer } = useSigner()
  const mechAddress = calculateERC721MechAddress(
    nft.contractAddress,
    nft.tokenId
  )

  const handleDeploy = async () => {
    setDeploying(true)
    try {
      const deployTx = await deployERC721Mech(
        nft.contractAddress,
        nft.tokenId,
        signer as JsonRpcSigner
      )
      console.log("deploy tx", deployTx)
      setDeploying(false)
    } catch (e) {
      console.error(e)
      setDeploying(false)
    }
  }

  return (
    <div className={classes.itemContainer}>
      <div className={classes.header}>
        <p className={classes.tokenName}>
          {nft.name || nft.collectionName || "..."}
        </p>
        {nft.tokenId.length < 5 && (
          <p className={classes.tokenId}>{nft.tokenId || "..."}</p>
        )}
      </div>
      <div className={classes.main}>
        {(error || imageError || isLoading) && (
          <div className={classes.noImage}></div>
        )}
        {!isLoading && !error && !imageError && (
          <div className={classes.imageContainer}>
            <img
              src={data ? data.image : nft.imageUrl}
              alt={nft.name}
              className={classes.image}
              onError={() => setImageError(true)}
            />
          </div>
        )}
        <div className={classes.info}>
          <div
            className={clsx(classes.infoItem, classes.address)}
            onClick={() => copy(mechAddress)}
          >
            {shortenAddress(mechAddress)}
          </div>
        </div>
      </div>
      {nft.hasMech ? (
        <Button onClick={() => {}}>Use Mech</Button>
      ) : (
        <>
          {deploying ? (
            <div className={classes.spinner}>
              <Spinner />
            </div>
          ) : (
            <Button onClick={handleDeploy} secondary>
              Deploy Mech
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export default NFTItem
