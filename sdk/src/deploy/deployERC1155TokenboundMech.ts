import { encodeFunctionData, getCreate2Address, WalletClient } from "viem"

import { ERC1155TokenboundMech__factory } from "../../../typechain-types"
import {
  DEFAULT_SALT,
  ERC2470_SINGLETON_FACTORY_ADDRESS,
  ERC6551_REGISTRY_ABI,
  ERC6551_REGISTRY_ADDRESS,
} from "../constants"

import { deployMastercopy, erc6551ProxyBytecode } from "./factory"

export const calculateERC1155TokenboundMechAddress = (context: {
  /** Address of the ERC1155 token contract */
  chainId: number
  /** Address of the ERC1155 token contract */
  token: `0x${string}`
  /** ID of the ERC1155 token */
  tokenId: bigint
  salt?: `0x${string}`
  from?: `0x${string}`
}) => {
  return getCreate2Address({
    bytecode: erc6551ProxyBytecode(
      calculateERC1155TokenboundMechMastercopyAddress(),
      context
    ),
    from: context.from || ERC6551_REGISTRY_ADDRESS,
    salt: context.salt || DEFAULT_SALT,
  })
}

export const calculateERC1155TokenboundMechMastercopyAddress = () => {
  return getCreate2Address({
    bytecode: ERC1155TokenboundMech__factory.bytecode,
    from: ERC2470_SINGLETON_FACTORY_ADDRESS,
    salt: DEFAULT_SALT,
  })
}

export const makeERC1155TokenboundMechDeployTransaction = ({
  chainId,
  token,
  tokenId,
  salt = DEFAULT_SALT,
  from = ERC6551_REGISTRY_ADDRESS,
}: {
  /** ID of the chain the token lives on */
  chainId: number
  /** Address of the ERC1155 token contract */
  token: `0x${string}`
  /** ID of the ERC1155 token */
  tokenId: bigint
  salt?: string
  from?: `0x${string}`
}) => {
  return {
    to: from,
    data: encodeFunctionData({
      abi: ERC6551_REGISTRY_ABI,
      functionName: "createAccount",
      args: [
        calculateERC1155TokenboundMechMastercopyAddress(),
        salt,
        chainId,
        token,
        tokenId,
      ],
    }),
  }
}

export const deployERC1155TokenboundMech = async (
  walletClient: WalletClient,
  {
    chainId,
    token,
    tokenId,
    salt = DEFAULT_SALT,
    from = ERC6551_REGISTRY_ADDRESS,
  }: {
    /** ID of the chain the token lives on, default to the current chain of walletClient */
    chainId?: number
    /** Address of the ERC1155 token contract */
    token: `0x${string}`
    /** ID of the ERC1155 token */
    tokenId: bigint
    salt?: `0x${string}`
    from?: `0x${string}`
  }
) => {
  const { chain, account } = walletClient
  if (!chain) throw new Error("No chain defined in walletClient")
  if (!account) throw new Error("No account defined in walletClient")

  const tokenChainId = chainId ?? chain.id

  const transaction = makeERC1155TokenboundMechDeployTransaction({
    chainId: tokenChainId,
    token,
    tokenId,
    salt,
    from,
  })

  return walletClient.sendTransaction({
    ...transaction,
    account,
    chain,
  })
}

export const deployERC1155TokenboundMechMastercopy = async (
  walletClient: WalletClient
) => {
  return await deployMastercopy(
    walletClient,
    ERC1155TokenboundMech__factory.bytecode
  )
}
