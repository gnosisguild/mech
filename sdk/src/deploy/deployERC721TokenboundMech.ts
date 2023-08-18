import {
  encodeAbiParameters,
  encodeFunctionData,
  getCreate2Address,
  WalletClient,
} from "viem"

import { ERC721TokenboundMech__factory } from "../../../typechain-types"
import {
  DEFAULT_SALT,
  ERC2470_SINGLETON_FACTORY_ADDRESS,
  ERC6551_REGISTRY_ABI,
  ERC6551_REGISTRY_ADDRESS,
} from "../constants"

import { deployMastercopy, mechProxyBytecode } from "./factory"

export const calculateERC721TokenboundMechAddress = ({
  chainId,
  token,
  tokenId,
  salt = DEFAULT_SALT,
}: {
  /** Address of the ERC721 token contract */
  chainId: number
  /** Address of the ERC721 token contract */
  token: `0x${string}`
  /** ID of the ERC721 token */
  tokenId: bigint
  salt: `0x${string}`
}) => {
  const context = encodeAbiParameters(
    [{ type: "uint256" }, { type: "address" }, { type: "uint256" }],
    [BigInt(chainId), token, tokenId]
  )

  return getCreate2Address({
    bytecode: mechProxyBytecode(
      calculateERC721TokenboundMechMastercopyAddress(),
      context
    ),
    from: ERC6551_REGISTRY_ADDRESS,
    salt,
  })
}

export const calculateERC721TokenboundMechMastercopyAddress = () => {
  return getCreate2Address({
    bytecode: ERC721TokenboundMech__factory.bytecode,
    from: ERC2470_SINGLETON_FACTORY_ADDRESS,
    salt: DEFAULT_SALT,
  })
}

export const makeERC721TokenboundMechDeployTransaction = ({
  chainId,
  token,
  tokenId,
  salt = DEFAULT_SALT,
}: {
  /** ID of the chain the token lives on */
  chainId: number
  /** Address of the ERC721 token contract */
  token: `0x${string}`
  /** ID of the ERC721 token */
  tokenId: bigint
  salt: string
}) => {
  return {
    to: ERC6551_REGISTRY_ADDRESS,
    data: encodeFunctionData({
      abi: ERC6551_REGISTRY_ABI,
      functionName: "createAccount",
      args: [
        calculateERC721TokenboundMechMastercopyAddress(),
        chainId,
        token,
        tokenId,
        salt,
      ],
    }),
  }
}

export const deployERC721TokenboundMech = async (
  walletClient: WalletClient,
  {
    chainId,
    token,
    tokenId,
    salt = DEFAULT_SALT,
  }: {
    /** ID of the chain the token lives on, default to the current chain of walletClient */
    chainId?: number
    /** Address of the ERC721 token contract */
    token: `0x${string}`
    /** ID of the ERC721 token */
    tokenId: bigint
    salt: `0x${string}`
  }
) => {
  const { chain, account } = walletClient
  if (!chain) throw new Error("No chain defined in walletClient")
  if (!account) throw new Error("No account defined in walletClient")

  const tokenChainId = chainId ?? chain.id

  const transaction = makeERC721TokenboundMechDeployTransaction({
    chainId: tokenChainId,
    token,
    tokenId,
    salt,
  })

  return walletClient.sendTransaction({
    ...transaction,
    account,
    chain,
  })
}

export const deployERC721TokenboundMechMastercopy = async (
  walletClient: WalletClient
) => {
  return await deployMastercopy(
    walletClient,
    ERC721TokenboundMech__factory.bytecode
  )
}
