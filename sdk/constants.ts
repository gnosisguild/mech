export const MECH_FACTORY_ADDRESS =
  "0x000000000000000000000000000000000000eeee" as const // TODO get MechFactory deployed to a nice vanity address

export const ERC6551_REGISTRY_ADDRESS =
  "0x0000000000000000000000000000000000006551" as const // TODO

export const ERC2470_SINGLETON_FACTORY_ADDRESS =
  "0xce0042b868300000d44a59004da54a005ffdcf9f" as const

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const

export const DEFAULT_SALT =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const

export const SENTINEL_MODULES =
  "0x0000000000000000000000000000000000000001" as const

export const ERC6551_REGISTRY_ABI = [
  "createAccount(address implementation, uint256 chainId, address tokenContract, uint256 tokenId, uint256 salt, bytes initData) returns (address)",
]
