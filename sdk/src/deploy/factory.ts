import {
  concat,
  encodeAbiParameters,
  getContract,
  parseEther,
  size,
  WalletClient,
} from "viem"

import { MechFactory__factory } from "../../../typechain-types"
import { ERC2470_SINGLETON_FACTORY_ADDRESS } from "../constants"

export const mechProxyBytecode = (
  implementation: `0x${string}`,
  context: `0x${string}` | Uint8Array
) => {
  if (implementation.length !== 42) {
    throw new Error(`Invalid implementation address: ${implementation}`)
  }

  return concat([
    "0x3d61", // RETURNDATASIZE, PUSH2
    encodeAbiParameters([{ type: "uint16" }], [0x2d + size(context) + 1]), // size of minimal proxy (45 bytes) + size of context + stop byte
    "0x8060", // DUP1, PUSH1
    encodeAbiParameters([{ type: "uint8" }], [0x0a + 1]), // default offset (0x0a) + 1 byte because we increased size from uint8 to uint16
    "0x3d3981f3363d3d373d3d3d363d73", // standard EIP1167 implementation
    implementation, // implementation address
    "0x5af43d82803e903d91602b57fd5bf3", // standard EIP1167 implementation
    "0x00", // stop byte (prevents context from executing as code)
    context, // appended context data
  ])
}

/**
 * Deploy a mastercopy via the ERC-2470 singleton factory.
 */
export const deployMastercopy = async (
  walletClient: WalletClient,
  bytecode: `0x${string}`
) => {
  const singletonFactory = getContract({
    address: ERC2470_SINGLETON_FACTORY_ADDRESS,
    abi: [
      "function deploy(bytes memory _initCode, bytes32 _salt) public returns (address payable createdContract)",
    ],
    walletClient,
  })

  await singletonFactory.write.deploy([bytecode])
}

/**
 * Deploy MechFactory via the ERC-2470 singleton factory.
 */
export const deployMechFactory = async (walletClient: WalletClient) => {
  await deployMastercopy(walletClient, MechFactory__factory.bytecode)
}

/**
 * Deploy the ERC-2470 singleton factory on networks where it doesn't exist yet.
 */
export const deployERC2470SingletonFactory = async (
  walletClient: WalletClient
) => {
  if (!walletClient.account) {
    throw new Error("walletClient.account is undefined")
  }

  await walletClient.sendTransaction({
    account: walletClient.account,
    chain: walletClient.chain,
    to: "0xBb6e024b9cFFACB947A71991E386681B1Cd1477D",
    value: parseEther("0.0247"),
  })

  await walletClient.request({
    method: "eth_sendRawTransaction",
    params: [
      "0xf9016c8085174876e8008303c4d88080b90154608060405234801561001057600080fd5b50610134806100206000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80634af63f0214602d575b600080fd5b60cf60048036036040811015604157600080fd5b810190602081018135640100000000811115605b57600080fd5b820183602082011115606c57600080fd5b80359060200191846001830284011164010000000083111715608d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550509135925060eb915050565b604080516001600160a01b039092168252519081900360200190f35b6000818351602085016000f5939250505056fea26469706673582212206b44f8a82cb6b156bfcc3dc6aadd6df4eefd204bc928a4397fd15dacf6d5320564736f6c634300060200331b83247000822470",
    ],
  })
}
