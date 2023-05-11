import { JsonRpcSigner } from "@ethersproject/providers"
import {
  deployERC1155Mech,
  deployERC721Mech,
  makeERC1155MechDeployTransaction,
  makeERC721MechDeployTransaction,
} from "mech-sdk"
import { MechNFT } from "../hooks/useNFTsByOwner"

export const deployMech = (token: MechNFT, signer: JsonRpcSigner) => {
  return token.tokenStandard === "ERC-1155"
    ? deployERC1155Mech(
        token.contractAddress,
        [token.nft.tokenID],
        [1],
        1,
        signer
      )
    : deployERC721Mech(token.contractAddress, token.nft.tokenID, signer)
}

export const makeMechDeployTransaction = (token: MechNFT) => {
  const chainId = parseInt(token.blockchain.shortChainID)
  return token.tokenStandard === "ERC-1155"
    ? makeERC1155MechDeployTransaction(
        token.contractAddress,
        [token.nft.tokenID],
        [1],
        1,
        chainId
      )
    : makeERC721MechDeployTransaction(
        token.contractAddress,
        token.nft.tokenID,
        chainId
      )
}
