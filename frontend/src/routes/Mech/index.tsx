import React from "react"
import { useParams } from "react-router-dom"
import { calculateERC721MechAddress } from "mech"
import { useChainId } from "wagmi"

import Layout from "../../components/Layout"
import { useErc721OwnerOf } from "../../generated"
import { BigNumber } from "ethers"
import useNFT from "../../hooks/useNFT"
import NFTItem from "../../components/NFTItem"

import classes from "./Mech.module.css"
import Spinner from "../../components/Spinner"
import MechConnect from "../../components/Connect/Connect"
import { ProvideWalletConnect } from "../../hooks/useWalletConnect"

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

  const mechAddress = calculateERC721MechAddress(token, tokenId)

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
              <MechConnect />
            </ProvideWalletConnect>
          </>
        )}
      </div>
    </Layout>
  )
}
export default Mech

const handleRequest = async (props: any) => {
  console.log("handle REQUEST", props)
  return "test"
}
