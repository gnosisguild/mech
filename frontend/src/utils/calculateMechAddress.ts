import {
  calculateERC1155MechAddress,
  calculateERC721MechAddress,
} from "mech-sdk"
import { MechNFT } from "../hooks/useNFTsByOwner"

export const calculateMechAddress = (token: MechNFT) => {
  return token.tokenStandard === "ERC-1155"
    ? calculateERC1155MechAddress(
        token.contractAddress,
        [token.nft.tokenID],
        [1],
        1
      )
    : calculateERC721MechAddress(token.contractAddress, token.nft.tokenID)
}
