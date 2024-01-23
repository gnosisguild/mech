import React from "react"
import { useParams } from "react-router-dom"
import Layout from "../../components/Layout"
import NFTItem from "../../components/NFTItem"

import classes from "./Mech.module.css"
import Loading from "../../components/Loading"
import MechConnect from "../../components/Connect"
import { ProvideWalletConnect } from "../../hooks/useWalletConnect"
import { useHandleRequest } from "../../hooks/useHandleRequest"
import { useDeployMech } from "../../hooks/useDeployMech"
import MechDeploy from "../../components/Deploy"
import { calculateMechAddress } from "../../utils/calculateMechAddress"
import { CHAINS } from "../../chains"
import useNFTMetadata from "../../hooks/useTokenMetadata"
import { getNFTContext } from "../../utils/getNFTContext"

const Mech: React.FC = () => {
  const { token, tokenId } = useParams()

  if (!token || !tokenId) {
    throw new Error("token and tokenId are required")
  }

  const [chainPrefix, contractAddress] = token.split(":")
  if (!chainPrefix || !contractAddress) {
    throw new Error("token must be in the format <chain>:<contractAddress>")
  }
  const chain = Object.values(CHAINS).find((c) => c.prefix === chainPrefix)

  if (!chain) {
    throw new Error(`chain ${chainPrefix} not support`)
  }

  if (!contractAddress.startsWith("0x")) {
    throw new Error("token must be a valid address")
  }

  const {
    data: nft,
    isLoading,
    error,
  } = useNFTMetadata({
    chainId: chain.id,
    tokenAddress: contractAddress,
    tokenId,
  })

  const { deployed, deploy, deployPending } = useDeployMech(
    nft ? getNFTContext(nft) : null,
    chain.id
  )

  const mechAddress = nft
    ? calculateMechAddress(getNFTContext(nft), chain.id)
    : null

  const handleRequest = useHandleRequest(mechAddress)

  return (
    <Layout>
      <div className={classes.container}>
        {isLoading && <Loading />}
        {!error && !isLoading && nft && mechAddress && (
          <>
            <NFTItem nft={nft} chainId={chain.id} />

            <ProvideWalletConnect
              chainId={chain.id}
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
