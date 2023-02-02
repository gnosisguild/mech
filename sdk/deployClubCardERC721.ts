import { defaultAbiCoder } from "@ethersproject/abi"
import {
  JsonRpcProvider,
  JsonRpcSigner,
  Provider,
} from "@ethersproject/providers"
import {
  deployAndSetUpCustomModule,
  deployMastercopyWithInitData,
  SupportedNetworks,
} from "@gnosis.pm/zodiac"
import { BigNumberish } from "ethers"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { ClubCardERC721__factory } from "../typechain-types"
import {
  calculateClubCardERC721Address,
  calculateClubCardERC721MastercopyAddress,
} from "./calculateClubCardERC721Address"
import { DEFAULT_SALT, ZERO_ADDRESS } from "./constants"

export const makeClubCardERC721DeployTransaction = (
  /** Address of the ERC721 token contract */
  token: string,
  /** ID of the ERC721 token */
  tokenId: BigNumberish,
  provider: JsonRpcProvider,
  salt: string = DEFAULT_SALT
) => {
  const { chainId } = provider.network

  const { transaction } = deployAndSetUpCustomModule(
    calculateClubCardERC721MastercopyAddress(),
    ClubCardERC721__factory.abi as any,
    {
      types: ["address", "uint256"],
      values: [token, tokenId],
    },
    provider,
    chainId,
    salt
  )

  return transaction
}

export const deployClubCardERC721 = async (
  /** Address of the ERC721 token contract */
  token: string,
  /** ID of the ERC721 token */
  tokenId: BigNumberish,
  signer: JsonRpcSigner,
  salt: string = DEFAULT_SALT
) => {
  // make sure the club card does not already exist
  const deterministicAddress = calculateClubCardERC721Address(
    token,
    tokenId,
    salt
  )
  if ((await signer.provider.getCode(deterministicAddress)) !== "0x") {
    throw new Error(
      `A club card with the same token and token ID already exists at ${deterministicAddress}`
    )
  }

  const { chainId } = signer.provider.network
  // make sure the network is supported
  if (!Object.values(SupportedNetworks).includes(chainId)) {
    throw new Error(`Network #${chainId} is not supported yet.`)
  }

  // make sure the mastercopy is deployed
  const mastercopyAddress = calculateClubCardERC721MastercopyAddress()
  if ((await signer.provider.getCode(mastercopyAddress)) === "0x") {
    throw new Error(
      `ClubCardERC721 mastercopy is not deployed on network #${chainId} yet. Please deploy it first.`
    )
  }

  const transaction = makeClubCardERC721DeployTransaction(
    token,
    tokenId,
    signer.provider,
    salt
  )

  return signer.sendTransaction(transaction)
}

export const deployClubCardERC721Mastercopy = async (
  hre: HardhatRuntimeEnvironment
) => {
  const initData = defaultAbiCoder.encode(
    ["address", "uint256"],
    [ZERO_ADDRESS, 0]
  )
  return await deployMastercopyWithInitData(
    hre,
    ClubCardERC721__factory.bytecode + initData.slice(2),
    DEFAULT_SALT
  )
}
