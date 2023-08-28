import {
  calculateERC1155TokenboundMechAddress,
  calculateERC721TokenboundMechAddress,
} from "mech-sdk"
import { MechNFT } from "../hooks/useNFTsByOwner"

export const calculateMechAddress = (token: MechNFT) => {
  const context = {
    chainId: parseInt(token.blockchain.shortChainID),
    token: token.contractAddress as `0x${string}`,
    tokenId: BigInt(token.nft.tokenID),
  }
  return token.tokenStandard === "ERC-1155"
    ? calculateERC1155TokenboundMechAddress(context)
    : calculateERC721TokenboundMechAddress(context)
}
