import { defaultAbiCoder } from "@ethersproject/abi"
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers"
import {
  deployAndSetUpCustomModule,
  deployMastercopyWithInitData,
  SupportedNetworks,
} from "@gnosis.pm/zodiac"
import {
  getCreate2Address,
  keccak256,
  solidityKeccak256,
} from "ethers/lib/utils"

import {
  IFactoryFriendly__factory,
  ZodiacMech__factory,
} from "../../../typechain-types"
import {
  DEFAULT_SALT,
  ERC2470_SINGLETON_FACTORY_ADDRESS,
  MODULE_PROXY_FACTORY_ADDRESS,
} from "../constants"

export const calculateZodiacMechAddress = (
  /** Addresses of the Zodiac modules */
  modules: string[],
  salt: string = DEFAULT_SALT
) => {
  const initData =
    IFactoryFriendly__factory.createInterface().encodeFunctionData("setUp", [
      defaultAbiCoder.encode(["address[]"], [modules]),
    ])

  // ERC-1167 minimal proxy bytecode
  const byteCode =
    "0x602d8060093d393df3363d3d373d3d3d363d73" +
    calculateZodiacMechMastercopyAddress().toLowerCase().slice(2) +
    "5af43d82803e903d91602b57fd5bf3"

  return getCreate2Address(
    MODULE_PROXY_FACTORY_ADDRESS,
    solidityKeccak256(
      ["bytes32", "uint256"],
      [solidityKeccak256(["bytes"], [initData]), salt]
    ),
    keccak256(byteCode)
  ) as `0x${string}`
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
  ) as `0x${string}`
}

export const makeZodiacMechDeployTransaction = (
  /** Addresses of the Zodiac modules */
  modules: string[],
  chainId: number,
  salt: string = DEFAULT_SALT
) => {
  const { transaction } = deployAndSetUpCustomModule(
    calculateZodiacMechMastercopyAddress(),
    ZodiacMech__factory.abi,
    {
      types: ["address[]"],
      values: [modules],
    },
    new JsonRpcProvider(undefined, chainId), // this provider instance is never really be used in deployAndSetUpCustomModule(),
    chainId,
    salt
  )

  return {
    to: transaction.to as `0x${string}`,
    data: transaction.data as `0x${string}`,
    value: transaction.value.toBigInt(),
  }
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
      `A mech with the same set of modules and salt already exists at ${deterministicAddress}`
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

  const transaction = makeZodiacMechDeployTransaction(modules, chainId, salt)

  return signer.sendTransaction(transaction)
}

export const deployZodiacMechMastercopy = async (signer: JsonRpcSigner) => {
  const initData = defaultAbiCoder.encode(
    ["address[]"],
    ZODIAC_MASTERCOPY_INIT_DATA
  )
  return (await deployMastercopyWithInitData(
    signer,
    ZodiacMech__factory.bytecode + initData.slice(2),
    DEFAULT_SALT
  )) as `0x${string}`
}
