import {
  IFactoryFriendly__factory,
  ZodiacMech__factory,
} from "../../typechain-types"

import {
  DEFAULT_SALT,
  INIT_ADDRESS,
  MODULE_PROXY_FACTORY_ADDRESS,
  ZODIAC_SINGLETON_FACTORY_ADDRESS,
} from "../constants"

import { defaultAbiCoder } from "@ethersproject/abi"
import { ethers } from "ethers"
import { getCreate2Address, keccak256 } from "ethers/lib/utils"

export const calculateZodiacMechAddress = (
  /** Addresses of the Zodiac modules */
  modules: string[],
  salt: string = DEFAULT_SALT
) => {
  const initData =
    IFactoryFriendly__factory.createInterface().encodeFunctionData("setUp", [
      defaultAbiCoder.encode(["address[]"], [modules]),
    ])

  const byteCode =
    "0x602d8060093d393df3363d3d373d3d3d363d73" +
    calculateZodiacMechMastercopyAddress().toLowerCase().slice(2) +
    "5af43d82803e903d91602b57fd5bf3"

  return ethers.utils.getCreate2Address(
    MODULE_PROXY_FACTORY_ADDRESS,
    ethers.utils.solidityKeccak256(
      ["bytes32", "uint256"],
      [ethers.utils.solidityKeccak256(["bytes"], [initData]), salt]
    ),
    ethers.utils.keccak256(byteCode)
  )
}
export const calculateZodiacMechAddress2 = calculateZodiacMechAddress

export const calculateZodiacMechMastercopyAddress = () => {
  const initData = defaultAbiCoder.encode(["address[]"], [[INIT_ADDRESS]])
  return getCreate2Address(
    ZODIAC_SINGLETON_FACTORY_ADDRESS,
    DEFAULT_SALT,
    keccak256(ZodiacMech__factory.bytecode + initData.slice(2))
  )
}
