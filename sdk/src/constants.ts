export const MECH_FACTORY_ADDRESS =
  "0x000000000000000000000000000000000000eeee" as const // TODO get MechFactory deployed to a nice vanity address

export const ERC6551_REGISTRY_ADDRESS =
  "0x51aD9b7E1C9c3b208c72cB3cF44B9aA24Ecf9477" as const

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
    inputs: [],
    name: "AccountCreationFailed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "tokenContract",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC6551AccountCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "tokenContract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "account",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "tokenContract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "createAccount",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
]
