import { defaultAbiCoder } from "@ethersproject/abi"
import {
  calculateProxyAddress,
  ContractAddresses,
  ContractFactories,
  KnownContracts,
  SupportedNetworks,
} from "@gnosis.pm/zodiac"
import { BigNumberish, ethers } from "ethers"
import { getCreate2Address, keccak256 } from "ethers/lib/utils"
import { ClubCardERC721__factory } from "../typechain-types"

import {
  DEFAULT_SALT,
  ZERO_ADDRESS,
  ZODIAC_SINGLETON_FACTORY_ADDRESS,
} from "./constants"

// TODO make this independent of a provider & chain ID
export const calculateClubCardERC721Address = (
  chainId: SupportedNetworks,
  /** Address of the ERC721 token contract */
  token: string,
  /** ID of the ERC721 token */
  tokenId: BigNumberish,
  salt: string = DEFAULT_SALT
) => {
  const moduleFactoryContract = ContractFactories[
    KnownContracts.FACTORY
  ].connect(
    ContractAddresses[chainId][KnownContracts.FACTORY],
    ethers.getDefaultProvider()
  )
  const initData = defaultAbiCoder.encode(
    ["address", "uint256"],
    [token, tokenId]
  )
  return calculateProxyAddress(
    moduleFactoryContract,
    calculateClubCardERC721MastercopyAddress(),
    initData,
    salt
  )
}

export const calculateClubCardERC721MastercopyAddress = () => {
  const initData = defaultAbiCoder.encode(
    ["address", "uint256"],
    [ZERO_ADDRESS, 0]
  )
  return getCreate2Address(
    ZODIAC_SINGLETON_FACTORY_ADDRESS,
    DEFAULT_SALT,
    keccak256(ClubCardERC721__factory.bytecode + initData.slice(2))
  )
}
