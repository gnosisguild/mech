import { defaultAbiCoder } from "@ethersproject/abi"
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers"
import {
  deployAndSetUpCustomModule,
  deployMastercopyWithInitData,
  SupportedNetworks,
} from "@gnosis.pm/zodiac"
import { BigNumberish } from "ethers"

import { ERC721Mech__factory } from "../typechain-types"

import {
  calculateERC721MechAddress,
  calculateERC721MechMastercopyAddress,
} from "./calculateERC721MechAddress"
import { DEFAULT_SALT, INIT_ADDRESS } from "./constants"

export const makeERC721MechDeployTransaction = (
  /** Address of the ERC721 token contract */
  token: string,
  /** ID of the ERC721 token */
  tokenId: BigNumberish,
  chainId: number,
  salt: string = DEFAULT_SALT
) => {
  const { transaction } = deployAndSetUpCustomModule(
    calculateERC721MechMastercopyAddress(),
    ERC721Mech__factory.abi,
    {
      types: ["address", "uint256"],
      values: [token, tokenId],
    },
    new JsonRpcProvider(undefined, chainId), // this provider instance is never really be used in deployAndSetUpCustomModule()
    chainId,
    salt
  )

  return transaction
}

export const deployERC721Mech = async (
  /** Address of the ERC721 token contract */
  token: string,
  /** ID of the ERC721 token */
  tokenId: BigNumberish,
  signer: JsonRpcSigner,
  salt: string = DEFAULT_SALT
) => {
  // make sure the mech does not already exist
  const deterministicAddress = calculateERC721MechAddress(token, tokenId, salt)
  if ((await signer.provider.getCode(deterministicAddress)) !== "0x") {
    throw new Error(
      `A mech with the same token and token ID already exists at ${deterministicAddress}`
    )
  }

  const { chainId } = signer.provider.network
  // make sure the network is supported
  if (!Object.values(SupportedNetworks).includes(chainId)) {
    throw new Error(`Network #${chainId} is not supported yet.`)
  }

  // make sure the mastercopy is deployed
  const mastercopyAddress = calculateERC721MechMastercopyAddress()
  if ((await signer.provider.getCode(mastercopyAddress)) === "0x") {
    throw new Error(
      `ERC721Mech mastercopy is not deployed on network #${chainId} yet. Please deploy it first.`
    )
  }

  const transaction = makeERC721MechDeployTransaction(
    token,
    tokenId,
    signer.provider.network.chainId,
    salt
  )

  return signer.sendTransaction(transaction)
}

export const deployERC721MechMastercopy = async (signer: JsonRpcSigner) => {
  const initData = defaultAbiCoder.encode(
    ["address", "uint256"],
    [INIT_ADDRESS, 0] // important to use a non-zero address to make sure the mastercopy is considered initialized
  )
  return await deployMastercopyWithInitData(
    signer,
    ERC721Mech__factory.bytecode + initData.slice(2),
    DEFAULT_SALT
  )
}
