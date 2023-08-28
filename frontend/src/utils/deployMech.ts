import {
  makeERC1155TokenboundMechDeployTransaction,
  makeERC721TokenboundMechDeployTransaction,
} from "mech-sdk"
import { MechNFT } from "../hooks/useNFTsByOwner"

export const makeMechDeployTransaction = (token: MechNFT) => {
  const chainId = parseInt(token.blockchain.shortChainID)
  const context = {
    chainId: parseInt(token.blockchain.shortChainID),
    token: token.contractAddress as `0x${string}`,
    tokenId: BigInt(token.nft.tokenID),
  }
  return token.tokenStandard === "ERC-1155"
    ? makeERC1155TokenboundMechDeployTransaction(context)
    : makeERC721TokenboundMechDeployTransaction(context)
}
