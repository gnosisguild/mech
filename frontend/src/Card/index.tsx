import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { calculateClubCardERC721Address } from "clubcard"
import { useProvider } from "wagmi"
import Layout from "../Layout"
import { useErc721OwnerOf } from "../generated"
import { BigNumber } from "ethers"

const Card: React.FC = () => {
  const provider = useProvider()

  const [deployed, setDeployed] = useState(false)
  const { token, tokenId } = useParams()

  if (!token || !tokenId) {
    throw new Error("token and tokenId are required")
  }
  if (!token.startsWith("0x")) {
    throw new Error("token must be a valid address")
  }

  const { data: tokenOwner } = useErc721OwnerOf({
    address: token as `0x${string}`,
    args: [BigNumber.from(tokenId)],
  })

  const cardAddress = calculateClubCardERC721Address(token, tokenId)

  useEffect(() => {
    provider.getCode(cardAddress).then((code) => setDeployed(code !== "0x"))
  }, [provider, cardAddress])

  return (
    <Layout>
      <h3>
        Club Card {deployed ? "🟢" : "⚪️"} {cardAddress}
      </h3>
      <p>Token address: {token}</p>
      <p>Token ID: {tokenId}</p>
      <p>Token owner: {tokenOwner}</p>
    </Layout>
  )
}
export default Card
