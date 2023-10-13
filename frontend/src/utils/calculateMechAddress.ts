import { TokenBalance, ContractType } from "@0xsequence/indexer"
import {
  calculateERC1155TokenboundMechAddress,
  calculateERC721TokenboundMechAddress,
} from "mech-sdk"

export const calculateMechAddress = (token: TokenBalance) => {
  const context = {
    chainId: token.chainId,
    token: token.contractAddress as `0x${string}`,
    tokenId: BigInt(token.tokenID),
  }
  return token.contractType === ContractType.ERC1155
    ? calculateERC1155TokenboundMechAddress(context)
    : calculateERC721TokenboundMechAddress(context)
}
