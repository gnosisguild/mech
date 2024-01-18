import {
  calculateERC1155TokenboundMechAddress,
  calculateERC721TokenboundMechAddress,
} from "mech-sdk"
import { NFTContext } from "../types/Token"

export const calculateMechAddress = (token: NFTContext, chainId: number) => {
  const context = {
    chainId,
    token: token.tokenAddress as `0x${string}`,
    tokenId: BigInt(token.tokenId),
  }
  return token.contractType === "ERC1155"
    ? calculateERC1155TokenboundMechAddress(context)
    : calculateERC721TokenboundMechAddress(context)
}
