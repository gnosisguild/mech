import { defaultAbiCoder } from "@ethersproject/abi"
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers"
import {
  deployMastercopyWithInitData,
  SupportedNetworks,
} from "@gnosis.pm/zodiac"
import {
  getCreate2Address,
  keccak256,
  solidityKeccak256,
} from "ethers/lib/utils"

import { ZodiacMech__factory } from "../../typechain-types"
import { DEFAULT_SALT, ERC2470_SINGLETON_FACTORY_ADDRESS } from "../constants"

import {
  deterministicDeploy,
  makeDeterministicDeployTransaction,
} from "./deterministicDeploy"

export const calculateZodiacMechAddress = (
  /** Addresses of the Zodiac modules */
  modules: string[],
  salt: string = DEFAULT_SALT
) => {
  const initData = solidityKeccak256(["address[]"], [modules])

  const bytecode =
    "0x602d8060093d393df3363d3d373d3d3d363d73" +
    calculateZodiacMechMastercopyAddress().toLowerCase().slice(2) +
    "5af43d82803e903d91602b57fd5bf3"

  return getCreate2Address(
    ERC2470_SINGLETON_FACTORY_ADDRESS,
    salt,
    keccak256(bytecode + initData.slice(2))
  )
}

export const ZODIAC_MASTERCOPY_INIT_DATA = [[]]
export const calculateZodiacMechMastercopyAddress = () => {
  const initData = defaultAbiCoder.encode(
    ["address[]"],
    ZODIAC_MASTERCOPY_INIT_DATA
  )
  return getCreate2Address(
    ERC2470_SINGLETON_FACTORY_ADDRESS,
    DEFAULT_SALT,
    keccak256(ZodiacMech__factory.bytecode + initData.slice(2))
  )
}

// ERC-1167 minimal proxy bytecode
const PROXY_BYTECODE =
  "0x602d8060093d393df3363d3d373d3d3d363d73" +
  calculateZodiacMechMastercopyAddress().toLowerCase().slice(2) +
  "5af43d82803e903d91602b57fd5bf3"

export const makeZodiacMechDeployTransaction = (
  /** Addresses of the Zodiac modules */
  modules: string[],
  provider: JsonRpcProvider,
  salt: string = DEFAULT_SALT
) => {
  const initData = solidityKeccak256(["address[]"], [modules])

  return makeDeterministicDeployTransaction(
    PROXY_BYTECODE + initData.slice(2),
    salt
  )
}

export const deployZodiacMech = async (
  /** Addresses of the Zodiac modules */
  modules: string[],
  signer: JsonRpcSigner,
  salt: string = DEFAULT_SALT
) => {
  // make sure the mech does not already exist
  const deterministicAddress = calculateZodiacMechAddress(modules, salt)
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
  const mastercopyAddress = calculateZodiacMechMastercopyAddress()
  if ((await signer.provider.getCode(mastercopyAddress)) === "0x") {
    throw new Error(
      `ZodiacMech mastercopy is not deployed on network #${chainId} yet. Please deploy it first.`
    )
  }

  const initData = solidityKeccak256(["address[]"], [modules])

  return await deterministicDeploy(
    signer,
    PROXY_BYTECODE + initData.slice(2),
    DEFAULT_SALT
  )
}

export const deployZodiacMechMastercopy = async (signer: JsonRpcSigner) => {
  const initData = defaultAbiCoder.encode(
    ["address[]"],
    ZODIAC_MASTERCOPY_INIT_DATA
  )
  return await deployMastercopyWithInitData(
    signer,
    ZodiacMech__factory.bytecode + initData.slice(2),
    DEFAULT_SALT
  )
}
