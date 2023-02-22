import React from "react"
import { useParams } from "react-router-dom"
import { calculateERC721MechAddress } from "mech"

import Layout from "../../components/Layout"
import { useErc721OwnerOf } from "../../generated"
import { BigNumber } from "ethers"
import useNFT from "../../hooks/useNFT"
import NFTItem from "../../components/NFTItem"

import classes from "./Mech.module.css"
import Spinner from "../../components/Spinner"
import MechConnect from "../../components/Connect/Connect"

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
            <MechConnect />
          </>
        )}
      </div>
    </Layout>
  )
}
export default Mech
