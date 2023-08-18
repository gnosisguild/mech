import {
  makeERC1155MechDeployTransaction,
  makeERC721MechDeployTransaction,
} from "mech-sdk"
import { MechNFT } from "../hooks/useNFTsByOwner"

export const makeMechDeployTransaction = (token: MechNFT) => {
  const chainId = parseInt(token.blockchain.shortChainID)
  return token.tokenStandard === "ERC-1155"
    ? makeERC1155MechDeployTransaction(
        token.contractAddress,
        [token.nft.tokenID],
        [1],
        0,
        chainId
      )
    : makeERC721MechDeployTransaction(
        token.contractAddress,
        BigInt(token.nft.tokenID),
        chainId
      )
}
