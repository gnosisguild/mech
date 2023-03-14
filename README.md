# Mech

[![Build Status](https://github.com/gnosis/mech/actions/workflows/ci.yml/badge.svg)](https://github.com/gnosis/mech/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/gnosis/mech/badge.svg?branch=main&bust=1)](https://coveralls.io/github/gnosis/mech?branch=main)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://github.com/gnosis/CODE_OF_CONDUCT)

Smart account with programmable ownership

#### Transferrable ownership

- [ERC721Mech.sol](contracts/ERC721Mech.sol): allow the holder of a designated ERC-721 NFT to sign transactions on behalf of the Mech

#### Threshold ownership

- [ERC1155Mech.sol](contracts/ERC1155Mech.sol): allow holders of a minimum balance of ERC-1155 tokens to sign transactions on behalf of the Mech

#### Programmable ownership

- [ZodiacMech.sol](contracts/ZodiacMech.sol): allow enabled [zodiac](https://github.com/gnosis/zodiac) modules to sign transactions on behalf of the Mech
- [Mech.sol](contracts/base/Mech.sol): implement custom ownership terms by extending this abstract contract

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

### EIP-4337 account

Mechs implement the EIP-4337 [Account](contracts/base/Account.sol) interface meaning they allow bundlers to execute account-abstracted user operations from the Mech's address.
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

The idea for the ERC721 and ERC1155 mechs is that the mech instance for the designated tokens is deployed to a deterministic address.
This enables counterfactually funding the mech account (own token to unlock treasure) or granting access for it (use token as key card).
The deterministic deployment is implemented via Zodiac's [ModuleProxyFactory](https://github.com/gnosis/zodiac/blob/master/contracts/factory/ModuleProxyFactory.sol), through which each mech instance is deployed as an ERC-1167 minimal proxy.

### Immutable storage

The holder of the token gains full control over the mech account and can write to its storage without any restrictions via delegate calls.
Since tokens are transferrable this is problematic, as a past owner could mess with storage to change the mech's behavior in ways that future owners wouldn't expect.
That's why the ERC721 and ERC1155 versions of the mech avoid using storage but hard-code their configuration in bytecode.

To achieve this, Mech sub contracts can extend [ImmutableStorage](contracts/base/ImmutableStorage.sol) which allows writing data to the bytecode at a deterministic address once.
Note that using Solidity's `immutable` keyword is not an option for proxy contracts, since immutable fields can only be written to from the constructor which won't be invoked for proxy instances.

### Migrate a Safe to a ZodiacMech

The ZodiacMech uses the same storage layout at the Safe contracts, meaning that an existing Safe instance can be migrated to the ZodiacMech implementation.
For migrating a Safe it needs to delegate call the [SafeMigration.sol](contracts/libraries/SafeMigration.sol) contract's `migrate()` function.
This will revoke access for the Safe owners so that the account will only be controlled by enabled modules going forwards.
