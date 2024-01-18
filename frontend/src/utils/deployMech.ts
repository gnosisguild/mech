import {
  makeERC1155TokenboundMechDeployTransaction,
  makeERC721TokenboundMechDeployTransaction,
} from "mech-sdk"
import { NFTContext } from "../types/Token"

export const makeMechDeployTransaction = (
  token: NFTContext,
  chainId: number
) => {
  const context = {
    chainId,
    token: token.tokenAddress as `0x${string}`,
    tokenId: BigInt(token.tokenId),
  }
  return token.contractType === "ERC1155"
    ? makeERC1155TokenboundMechDeployTransaction(context)
    : makeERC721TokenboundMechDeployTransaction(context)
}
