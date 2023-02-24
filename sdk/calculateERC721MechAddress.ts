import {
  ERC721Mech__factory,
  IFactoryFriendly__factory,
} from "../typechain-types"

import {
  DEFAULT_SALT,
  INIT_ADDRESS,
  MODULE_PROXY_FACTORY_ADDRESS,
  ZODIAC_SINGLETON_FACTORY_ADDRESS,
} from "./constants"

import { defaultAbiCoder } from "@ethersproject/abi"
import { BigNumberish, ethers } from "ethers"
import { getCreate2Address, keccak256 } from "ethers/lib/utils"

export const calculateERC721MechAddress = (
  /** Address of the ERC721 token contract */
  token: string,
  /** ID of the ERC721 token */
  tokenId: BigNumberish,
  salt: string = DEFAULT_SALT
) => {
  const initData =
    IFactoryFriendly__factory.createInterface().encodeFunctionData("setUp", [
      defaultAbiCoder.encode(["address", "uint256"], [token, tokenId]),
    ])

  const byteCode =
    "0x602d8060093d393df3363d3d373d3d3d363d73" +
    calculateERC721MechMastercopyAddress().toLowerCase().slice(2) +
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
export const calculateERC721MechAddress2 = calculateERC721MechAddress

export const calculateERC721MechMastercopyAddress = () => {
  const initData = defaultAbiCoder.encode(
    ["address", "uint256"],
    [INIT_ADDRESS, 0]
  )
  return getCreate2Address(
    ZODIAC_SINGLETON_FACTORY_ADDRESS,
    DEFAULT_SALT,
    keccak256(ERC721Mech__factory.bytecode + initData.slice(2))
  )
}
