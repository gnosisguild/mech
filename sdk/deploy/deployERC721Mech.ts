import { defaultAbiCoder } from "@ethersproject/abi"
import { JsonRpcSigner } from "@ethersproject/providers"
import { SupportedNetworks } from "@gnosis.pm/zodiac"
import { BigNumberish } from "ethers"
import {
  getCreate2Address,
  keccak256,
  solidityKeccak256,
} from "ethers/lib/utils"

import { ERC721Mech__factory } from "../../typechain-types"
import {
  DEFAULT_SALT,
  ERC2470_SINGLETON_FACTORY_ADDRESS,
  ZERO_ADDRESS,
} from "../constants"

import {
  deterministicDeploy,
  makeDeterministicDeployTransaction,
} from "./deterministicDeploy"

export const calculateERC721MechAddress = (
  /** Address of the ERC721 token contract */
  token: string,
  /** ID of the ERC721 token */
  tokenId: BigNumberish,
  salt = DEFAULT_SALT
) => {
  const initData = solidityKeccak256(["address", "uint256"], [token, tokenId])
  return getCreate2Address(
    ERC2470_SINGLETON_FACTORY_ADDRESS,
    salt,
    keccak256(PROXY_BYTECODE + initData.slice(2))
  )
}

export const ERC721_MASTERCOPY_INIT_DATA = [ZERO_ADDRESS, 0]

export const calculateERC721MechMastercopyAddress = () => {
  const initData = defaultAbiCoder.encode(
    ["address", "uint256"],
    ERC721_MASTERCOPY_INIT_DATA
  )
  return getCreate2Address(
    ERC2470_SINGLETON_FACTORY_ADDRESS,
    DEFAULT_SALT,
    keccak256(ERC721Mech__factory.bytecode + initData.slice(2))
  )
}

// ERC-1167 minimal proxy bytecode
const PROXY_BYTECODE =
  "0x602d8060093d393df3363d3d373d3d3d363d73" +
  calculateERC721MechMastercopyAddress().toLowerCase().slice(2) +
  "5af43d82803e903d91602b57fd5bf3"

export const makeERC721MechDeployTransaction = (
  /** Address of the ERC721 token contract */
  token: string,
  /** ID of the ERC721 token */
  tokenId: BigNumberish,
  salt: string = DEFAULT_SALT
) => {
  const initData = solidityKeccak256(["address", "uint256"], [token, tokenId])

  return makeDeterministicDeployTransaction(
    PROXY_BYTECODE + initData.slice(2),
    salt
  )
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

  const initData = solidityKeccak256(["address", "uint256"], [token, tokenId])

  return await deterministicDeploy(
    signer,
    PROXY_BYTECODE + initData.slice(2),
    DEFAULT_SALT
  )
}

export const deployERC721MechMastercopy = async (signer: JsonRpcSigner) => {
  const initData = defaultAbiCoder.encode(
    ["address", "uint256"],
    ERC721_MASTERCOPY_INIT_DATA
  )
  return await deterministicDeploy(
    signer,
    ERC721Mech__factory.bytecode + initData.slice(2),
    DEFAULT_SALT
  )
}
