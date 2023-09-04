export const MECH_FACTORY_ADDRESS =
  "0x000000000000000000000000000000000000eeee" as const // TODO get MechFactory deployed to a nice vanity address

export const ERC6551_REGISTRY_ADDRESS =
  "0x22B874bf468C018C6B7e50eB47638cA93a31cC44" as const

export const ERC2470_SINGLETON_FACTORY_ADDRESS =
  "0xce0042b868300000d44a59004da54a005ffdcf9f" as const

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const

export const DEFAULT_SALT =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const

export const SENTINEL_MODULES =
  "0x0000000000000000000000000000000000000001" as const

export const ERC2470_SINGLETON_FACTORY_ABI = [
  {
    type: "function",
    name: "deploy",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes",
        name: "_initCode",
      },
      {
        type: "bytes32",
        name: "_salt",
      },
    ],
    outputs: [
      {
        type: "address",
        name: "createdContract",
      },
    ],
  },
]

export const ERC6551_REGISTRY_ABI = [
  {
    type: "function",
    name: "createAccount",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "address",
        name: "implementation",
      },
      {
        type: "uint256",
        name: "chainId",
      },
      {
        type: "address",
        name: "tokenContract",
      },
      {
        type: "uint256",
        name: "tokenId",
      },
      {
        type: "uint256",
        name: "salt",
      },
      {
        type: "bytes",
        name: "initData",
      },
    ],
    outputs: [
      {
        type: "address",
      },
    ],
  },
]
