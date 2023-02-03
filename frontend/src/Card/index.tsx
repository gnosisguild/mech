import React from "react"
import { useParams } from "react-router-dom"
import { calculateClubCardERC721Address } from "clubcard"

const Card: React.FC = () => {
  const { token, tokenId } = useParams()

  calculateClubCardERC721Address(token, tokenId)
  return (
    <div>
      Connect your wallet and select one of your club cards to get started
    </div>
  )
}
export default Card
