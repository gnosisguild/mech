# Mech

[![Build Status](https://github.com/gnosis/mech/actions/workflows/ci.yml/badge.svg)](https://github.com/gnosis/mech/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/gnosis/mech/badge.svg?branch=main&bust=1)](https://coveralls.io/github/gnosis/mech?branch=main)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://github.com/gnosis/CODE_OF_CONDUCT)

Smart account with programmable ownership

#### Token-bound ownership

- [ERC721TokenboundMech.sol](contracts/ERC721TokenboundMech.sol): allow the holder of a designated ERC-721 NFT to operate the Mech
- [ERC1155TokenboundMech.sol](contracts/ERC721TokenboundMech.sol): allow the holder of a designated ERC-1155 NFT to operate the Mech

#### Threshold ownership

- [ERC20ThresholdMech.sol](contracts/ERC20ThresholdMech.sol): allow holders of a minimum balance of an ERC-20 token to operate the Mech
- [ERC1155ThresholdMech.sol](contracts/ERC1155ThresholdMech.sol): allow holders of a minimum balances of designated ERC-1155 tokens to operate the Mech

#### Programmable ownership

- [ZodiacMech.sol](contracts/ZodiacMech.sol): allow enabled [zodiac](https://github.com/gnosis/zodiac) modules to sign transactions on behalf of the Mech
- [Mech.sol](contracts/base/Mech.sol): implement custom ownership terms by extending this abstract contract

## Mech interface

Mech implements the [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) account interface, [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271), and the following functions:

### `isOperator(address signer)`

Returns true if `signer` is allowed to operate the Mech.
Sub classes implement this function for defining the specific operator criteria.

### `exec(address to, uint256 value, bytes data, Enum.Operation operation, uint256 txGas)`

Allows the operator to make the Mech execute a transaction.

- `operation: 0` for a regular call
- `operation: 1` for a delegate call

## Contribute

The repo is structured as a monorepo with `mech-contracts` as the container package exporting the contract sources and artifacts.
`mech-sdk` is a set of TypeScript functions for interaction with the mech contracts.
`frontend` is a private package containing the sources for the mech wallet app running at https://mech-omega.vercel.app.

##### Install all dependencies

```
yarn install
```

##### Compile contracts and generate TypeScript interfaces for the SDK and front-end

```
yarn build
```

##### Build SDK

```
yarn build:sdk
```

This step is necessary to make changes in SDK functions available to a locally running front-end.

##### Start front-end

```
yarn start
```

##### Run tests

```
yarn test
```

Tests covers both, the contract logic as well as the SDK functions.

```
yarn integrationTest
```

Integration tests are run on a mainnet fork and cover the interaction of mech contracts with external contracts (Safe and EIP-4337 entry point).

## How it works

### EIP-4337 account abstraction

Mech implements the EIP-4337 [Account](contracts/base/Account.sol) interface meaning they allow bundlers to execute account-abstracted user operations from the Mech's address.
For this purpose the EIP-4337 entry point contract first calls the Mech's `validateUserOp()` function for checking if a user operation has a valid signature by the mech operator.
The entry point then calls the `exec` function, or any other function using the `onlyOperator` modifier, to trigger execution.

### EIP-1271 signatures

[Mech](contracts/base/Mech.sol) implements the EIP-1271 interface.
It validates that a given ECDSA signature is from the expected account where the expected account is derived using the `isOperator` function implemented by the sub contract.

Additionally, it supports validation of EIP-1271 contract signatures, which are expected to be given in the following format based on ECDSA {r, s, v} components with `v = 0` as the recovery identifier:

```
0x000000000000000000000000<20 bytes smart contract address>>>>>>>>  // r component: the address of signing EIP-1271 contract
  0000000000000000000000000000000000000000000000000000000000000041  // s component: constant 65 bytes offset to signature data
  00                                                                // v component: constant unpadded `0` as recovery identifier
  00000000000000000000000000000000<length of signature data bytes>
  <bytes of signature data>
```

An EIP-1271 signature will be considered valid if it meets the following conditions:

- the signing contract is either the operator of the mech or the mech itself, and
- the signing contract's `isValidSignature()` function returns `0x1626ba7e` (EIP-1271 magic value) for the given `<bytes of signature data>`.

### Deterministic deployment

The idea for the token-bound versions of mech is that the mech instance for a designated token is deployed to an address that can be deterministically derived from the token contract address and token ID.
This enables counterfactually funding the mech account (own token to unlock treasure) or granting access for it (use token as key card).

The deterministic deployment is implemented via Zodiac's [ModuleProxyFactory](https://github.com/gnosis/zodiac/blob/master/contracts/factory/ModuleProxyFactory.sol), through which each mech instance is deployed as an ERC-1167 minimal proxy.

### EIP-6551 token-bound account

The token-bound versions of Mech adopts the [EIP-6551](https://eips.ethereum.org/EIPS/eip-6551) standard.
This means that these kinds of mechs are deployed through the official 6551 account registry, so they are deployed to the canonical address and detected by compatible tools.

### EIP-1167 minimal proxies with context

The holder of the token gains full control over the mech account and can write to its storage without any restrictions via delegate calls.
Since tokens are transferrable this is problematic, as a past owner could mess with storage to change the mech's behavior in ways that future owners wouldn't expect.
That's why the ERC721 and ERC1155 versions of mech avoid using storage but instead solely rely on the immutable data in their own bytecode.

To achieve this, mechs are deployed through a version of a EIP-1167 proxy factory that allows appending arbitrary bytes to the minimal proxy bytecode.
The same mechanism is implemented by the 6551 account registry.

### Migrate a Safe to a ZodiacMech

The ZodiacMech uses the same storage layout at the Safe contracts, meaning that an existing Safe instance can be migrated to the ZodiacMech implementation.
For migrating a Safe it needs to delegate call the [SafeMigration.sol](contracts/libraries/SafeMigration.sol) contract's `migrate()` function.
This will revoke access for the Safe owners so that the account will only be controlled by enabled modules going forwards.
