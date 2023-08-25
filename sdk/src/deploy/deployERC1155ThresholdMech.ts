import {
  encodeAbiParameters,
  encodeFunctionData,
  getCreate2Address,
  WalletClient,
} from "viem"

import {
  ERC1155ThresholdMech__factory,
  MechFactory__factory,
} from "../../../typechain-types"
import {
  DEFAULT_SALT,
  ERC2470_SINGLETON_FACTORY_ADDRESS,
  MECH_FACTORY_ADDRESS,
} from "../constants"

import { deployMastercopy, mechProxyBytecode } from "./factory"

export const calculateERC1155ThresholdMechAddress = ({
  token,
  tokenIds,
  minBalances,
  minTotalBalance,
  salt = DEFAULT_SALT,
}: {
  /** Address of the ERC1155 token contract */
  token: `0x${string}`
  /** IDs of the tokens */
  tokenIds: bigint[]
  /** minimum balances of the tokens */
  minBalances: bigint[]
  /** minimum total balance over all tokens */
  minTotalBalance: bigint
  salt?: `0x${string}`
}) => {
  const context = encodeAbiParameters(
    [
      { type: "address" },
      { type: "uint256[]" },
      { type: "uint256[]" },
      { type: "uint256" },
    ],
    [token, tokenIds, minBalances, minTotalBalance]
  )

  return getCreate2Address({
    bytecode: mechProxyBytecode(
      calculateERC1155ThresholdMechMastercopyAddress(),
      context
    ),
    from: MECH_FACTORY_ADDRESS,
    salt,
  })
}

export const calculateERC1155ThresholdMechMastercopyAddress = () => {
  return getCreate2Address({
    bytecode: ERC1155ThresholdMech__factory.bytecode,
    from: ERC2470_SINGLETON_FACTORY_ADDRESS,
    salt: DEFAULT_SALT,
  })
}

export const makeERC1155ThresholdMechDeployTransaction = ({
  token,
  tokenIds,
  minBalances,
  minTotalBalance,
  salt = DEFAULT_SALT,
}: {
  /** Address of the ERC1155 token contract */
  token: `0x${string}`
  /** IDs of the tokens */
  tokenIds: bigint[]
  /** minimum balances of the tokens */
  minBalances: bigint[]
  /** minimum total balance over all tokens */
  minTotalBalance: bigint
  salt?: `0x${string}`
}) => {
  const context = encodeAbiParameters(
    [
      { type: "address" },
      { type: "uint256[]" },
      { type: "uint256[]" },
      { type: "uint256" },
    ],
    [token, tokenIds, minBalances, minTotalBalance]
  )

  return {
    to: MECH_FACTORY_ADDRESS,
    data: encodeFunctionData({
      abi: MechFactory__factory.abi,
      functionName: "deployMech",
      args: [
        calculateERC1155ThresholdMechMastercopyAddress(),
        context,
        "0x",
        salt,
      ],
    }),
  }
}

export const deployERC1155ThresholdMech = async (
  walletClient: WalletClient,
  {
    token,
    tokenIds,
    minBalances,
    minTotalBalance,
    salt = DEFAULT_SALT,
  }: {
    /** Address of the ERC1155 token contract */
    token: `0x${string}`
    /** IDs of the tokens */
    tokenIds: bigint[]
    /** minimum balances of the tokens */
    minBalances: bigint[]
    /** minimum total balance over all tokens */
    minTotalBalance: bigint
    salt?: `0x${string}`
  }
) => {
  const { chain, account } = walletClient
  if (!chain) throw new Error("No chain defined in walletClient")
  if (!account) throw new Error("No account defined in walletClient")

  const transaction = makeERC1155ThresholdMechDeployTransaction({
    token,
    tokenIds,
    minBalances,
    minTotalBalance,
    salt,
  })

  return walletClient.sendTransaction({
    ...transaction,
    account,
    chain,
  })
}

export const deployERC1155ThresholdMechMastercopy = async (
  walletClient: WalletClient
) => {
  return await deployMastercopy(
    walletClient,
    ERC1155ThresholdMech__factory.bytecode
  )
}
