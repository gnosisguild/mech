import {
  encodeFunctionData,
  getContract,
  getCreate2Address,
  WalletClient,
} from "viem"

import { ERC721TokenboundMech__factory } from "../../../typechain-types"
import {
  DEFAULT_SALT,
  ERC2470_SINGLETON_FACTORY_ABI,
  ERC2470_SINGLETON_FACTORY_ADDRESS,
  ERC6551_REGISTRY_ABI,
  ERC6551_REGISTRY_ADDRESS,
} from "../constants"

import { deployMastercopy, erc6551ProxyBytecode } from "./factory"

export const calculateERC721TokenboundMechAddress = (context: {
  /** Address of the ERC721 token contract */
  chainId: number
  /** Address of the ERC721 token contract */
  token: `0x${string}`
  /** ID of the ERC721 token */
  tokenId: bigint
  salt?: `0x${string}`
  from?: `0x${string}`
}) => {
  return getCreate2Address({
    bytecode: erc6551ProxyBytecode(
      calculateERC721TokenboundMechMastercopyAddress(),
      context
    ),
    from: context.from || ERC6551_REGISTRY_ADDRESS,
    salt: context.salt || DEFAULT_SALT,
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
  from = ERC6551_REGISTRY_ADDRESS,
}: {
  /** ID of the chain the token lives on */
  chainId: number
  /** Address of the ERC721 token contract */
  token: `0x${string}`
  /** ID of the ERC721 token */
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
        calculateERC721TokenboundMechMastercopyAddress(),
        salt,
        chainId,
        token,
        tokenId,
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
    from = ERC6551_REGISTRY_ADDRESS,
  }: {
    /** ID of the chain the token lives on, default to the current chain of walletClient */
    chainId?: number
    /** Address of the ERC721 token contract */
    token: `0x${string}`
    /** ID of the ERC721 token */
    tokenId: bigint
    salt?: `0x${string}`
    from?: `0x${string}`
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
    from,
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
  const singletonFactory = getContract({
    address: ERC2470_SINGLETON_FACTORY_ADDRESS,
    abi: ERC2470_SINGLETON_FACTORY_ABI,
    walletClient,
  })

  return await singletonFactory.write.deploy(
    [ERC721TokenboundMech__factory.bytecode, DEFAULT_SALT],
    {
      gas: 2000000,
    }
  )
}
