import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { calculateERC721MechAddress } from "mech"
import { useProvider } from "wagmi"
import Layout from "../components/Layout"
import { useErc721OwnerOf, useErc721Read } from "../generated"
import { BigNumber } from "ethers"

const Mech: React.FC = () => {
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

  const mechAddress = calculateERC721MechAddress(token, tokenId)

  useEffect(() => {
    provider.getCode(mechAddress).then((code) => setDeployed(code !== "0x"))
  }, [provider, mechAddress])

  return (
    <Layout>
      <h3>
        Mech {deployed ? "🟢" : "⚪️"} {mechAddress}
      </h3>
      <p>Token address: {token}</p>
      <p>Token ID: {tokenId}</p>
      <p>Token owner: {tokenOwner}</p>
    </Layout>
  )
}
export default Mech