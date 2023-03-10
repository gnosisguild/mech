import { defaultAbiCoder } from "@ethersproject/abi"
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers"
import {
  deployAndSetUpCustomModule,
  deployMastercopyWithInitData,
  SupportedNetworks,
} from "@gnosis.pm/zodiac"
import { BigNumberish } from "ethers"

import { ERC1155Mech__factory } from "../../typechain-types"
import { DEFAULT_SALT, INIT_ADDRESS } from "../constants"

import {
  calculateERC1155MechAddress,
  calculateERC1155MechMastercopyAddress,
  ERC1155_MASTERCOPY_INIT_DATA,
} from "./calculateERC1155MechAddress"

export const makeERC1155MechDeployTransaction = (
  /** Address of the ERC1155 token contract */
  token: string,
  /** IDs of the tokens */
  tokenIds: BigNumberish[],
  /** minimum balances of the tokens */
  minBalances: BigNumberish[],
  chainId: number,
  salt: string = DEFAULT_SALT
) => {
  const { transaction } = deployAndSetUpCustomModule(
    calculateERC1155MechMastercopyAddress(),
    ERC1155Mech__factory.abi,
    {
      types: ["address", "uint256[]", "uint256[]"],
      values: [token, tokenIds, minBalances],
    },
    new JsonRpcProvider(undefined, chainId), // this provider instance is never really be used in deployAndSetUpCustomModule()
    chainId,
    salt
  )

  return transaction
}

export const deployERC1155Mech = async (
  /** Address of the ERC1155 token contract */
  token: string,
  /** IDs of the tokens */
  tokenIds: BigNumberish[],
  /** minimum balances of the tokens */
  minBalances: BigNumberish[],
  signer: JsonRpcSigner,
  salt: string = DEFAULT_SALT
) => {
  // make sure the mech does not already exist
  const deterministicAddress = calculateERC1155MechAddress(
    token,
    tokenIds,
    minBalances,
    salt
  )
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
  const mastercopyAddress = calculateERC1155MechMastercopyAddress()
  if ((await signer.provider.getCode(mastercopyAddress)) === "0x") {
    throw new Error(
      `ERC1155Mech mastercopy is not deployed on network #${chainId} yet. Please deploy it first.`
    )
  }

  const transaction = makeERC1155MechDeployTransaction(
    token,
    tokenIds,
    minBalances,
    signer.provider.network.chainId,
    salt
  )

  return signer.sendTransaction(transaction)
}

export const deployERC1155MechMastercopy = async (signer: JsonRpcSigner) => {
  const initData = defaultAbiCoder.encode(
    ["address", "uint256[]", "uint256[]"],
    ERC1155_MASTERCOPY_INIT_DATA
  )
  return await deployMastercopyWithInitData(
    signer,
    ERC1155Mech__factory.bytecode + initData.slice(2),
    DEFAULT_SALT
  )
}
