import { defaultAbiCoder } from "@ethersproject/abi"
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers"
import {
  deployAndSetUpCustomModule,
  deployMastercopyWithInitData,
  SupportedNetworks,
} from "@gnosis.pm/zodiac"

import { ZodiacMech__factory } from "../../typechain-types"
import { DEFAULT_SALT, INIT_ADDRESS } from "../constants"

import {
  calculateZodiacMechAddress,
  calculateZodiacMechMastercopyAddress,
} from "./calculateZodiacMechAddress"

export const makeZodiacMechDeployTransaction = (
  /** Addresses of the Zodiac modules */
  modules: string[],
  provider: JsonRpcProvider,
  salt: string = DEFAULT_SALT
) => {
  const { chainId } = provider.network

  const { transaction } = deployAndSetUpCustomModule(
    calculateZodiacMechMastercopyAddress(),
    ZodiacMech__factory.abi,
    {
      types: ["address[]"],
      values: [modules],
    },
    provider,
    chainId,
    salt
  )

  return transaction
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

  const transaction = makeZodiacMechDeployTransaction(
    modules,
    signer.provider,
    salt
  )

  return signer.sendTransaction(transaction)
}

export const deployZodiacMechMastercopy = async (signer: JsonRpcSigner) => {
  const initData = defaultAbiCoder.encode(
    ["address[]"],
    [[INIT_ADDRESS]] // important to use a non-empty set of addresses, so noone can take ownership of the mastercopy
  )
  return await deployMastercopyWithInitData(
    signer,
    ZodiacMech__factory.bytecode + initData.slice(2),
    DEFAULT_SALT
  )
}
