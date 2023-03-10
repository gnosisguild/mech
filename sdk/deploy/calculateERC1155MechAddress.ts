import { defaultAbiCoder } from "@ethersproject/abi"
import { BigNumberish, ethers } from "ethers"
import { getCreate2Address, keccak256 } from "ethers/lib/utils"

import {
  ERC1155Mech__factory,
  IFactoryFriendly__factory,
} from "../../typechain-types"
import {
  DEFAULT_SALT,
  INIT_ADDRESS,
  MODULE_PROXY_FACTORY_ADDRESS,
  ZODIAC_SINGLETON_FACTORY_ADDRESS,
} from "../constants"

export const calculateERC1155MechAddress = (
  /** Address of the ERC1155 token contract */
  token: string,
  /** IDs of the tokens */
  tokenIds: BigNumberish[],
  /** minimum balances of the tokens */
  minBalances: BigNumberish[],
  salt: string = DEFAULT_SALT
) => {
  const initData =
    IFactoryFriendly__factory.createInterface().encodeFunctionData("setUp", [
      defaultAbiCoder.encode(
        ["address", "uint256[]", "uint256[]"],
        [token, tokenIds, minBalances]
      ),
    ])

  const byteCode =
    "0x602d8060093d393df3363d3d373d3d3d363d73" +
    calculateERC1155MechMastercopyAddress().toLowerCase().slice(2) +
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

export const ERC1155_MASTERCOPY_INIT_DATA = [INIT_ADDRESS, [0], [0]]
export const calculateERC1155MechMastercopyAddress = () => {
  const initData = defaultAbiCoder.encode(
    ["address", "uint256[]", "uint256[]"],
    ERC1155_MASTERCOPY_INIT_DATA
  )
  return getCreate2Address(
    ZODIAC_SINGLETON_FACTORY_ADDRESS,
    DEFAULT_SALT,
    keccak256(ERC1155Mech__factory.bytecode + initData.slice(2))
  )
}
