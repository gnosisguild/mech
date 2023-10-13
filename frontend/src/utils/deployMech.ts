import { TokenBalance, ContractType } from "@0xsequence/indexer"
import {
  makeERC1155TokenboundMechDeployTransaction,
  makeERC721TokenboundMechDeployTransaction,
} from "mech-sdk"

export const makeMechDeployTransaction = (token: TokenBalance) => {
  const context = {
    chainId: token.chainId,
    token: token.contractAddress as `0x${string}`,
    tokenId: BigInt(token.tokenID),
  }
  return token.contractType === ContractType.ERC1155
    ? makeERC1155TokenboundMechDeployTransaction(context)
    : makeERC721TokenboundMechDeployTransaction(context)
}
