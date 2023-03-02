import React from "react"
import { useParams } from "react-router-dom"
import { calculateERC721MechAddress } from "mech-sdk"
import { useChainId } from "wagmi"
import Layout from "../../components/Layout"
import { useErc721OwnerOf } from "../../generated"
import { BigNumber } from "ethers"
import useNFT from "../../hooks/useNFT"
import NFTItem from "../../components/NFTItem"

import classes from "./Mech.module.css"
import Spinner from "../../components/Spinner"
import MechConnect from "../../components/Connect"
import { ProvideWalletConnect } from "../../hooks/useWalletConnect"
import { useHandleRequest } from "../../hooks/useHandleRequest"
import { useDeployMech } from "../../hooks/useDeployMech"
import MechDeploy from "../../components/Deploy"

const Mech: React.FC = () => {
  const { token, tokenId } = useParams()

  if (!token || !tokenId) {
    throw new Error("token and tokenId are required")
  }
  if (!token.startsWith("0x")) {
    throw new Error("token must be a valid address")
  }

  const { data, error, isLoading } = useNFT({
    contractAddress: token,
    tokenId: tokenId,
    blockchain: "eth_goerli",
  })

  const chainId = useChainId()

  const { data: tokenOwner } = useErc721OwnerOf({
    address: token as `0x${string}`,
    args: [BigNumber.from(tokenId)],
  })

  const { deployed, deploy, deployPending } = useDeployMech(token, tokenId)

  const mechAddress = calculateERC721MechAddress(token, tokenId)

  const handleRequest = useHandleRequest(mechAddress)

  return (
    <Layout mechAddress={mechAddress}>
      <div className={classes.container}>
        {isLoading && <Spinner />}
        {!error && !isLoading && data && (
          <>
            <NFTItem
              token={token}
              tokenId={tokenId}
              nft={data}
              operatorAddress={tokenOwner}
            />

            <ProvideWalletConnect
              chainId={chainId}
              mechAddress={mechAddress}
              onRequest={handleRequest}
            >
              {deployed && <MechConnect />}
              {!deployed && (
                <MechDeploy deploy={deploy} deployPending={deployPending} />
              )}
            </ProvideWalletConnect>
          </>
        )}
      </div>
    </Layout>
  )
}

export default Mech
