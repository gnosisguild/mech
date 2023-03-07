# Mech

[![Build Status](https://github.com/gnosis/mech/actions/workflows/ci.yml/badge.svg)](https://github.com/gnosis/mech/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/gnosis/mech/badge.svg?branch=main)](https://coveralls.io/github/gnosis/mech?branch=main)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://github.com/gnosis/CODE_OF_CONDUCT)

Smart account with programmable ownership

#### Transferrable ownership

- [ERC721Mech.sol](contracts/ERC721Mech.sol): allow the holder of a designated ERC-721 NFT to sign transactions on behalf of the Mech

#### Threshold ownership

- [ERC20Mech.sol](contracts/ERC20Mech.sol): allow holders of a minimum balance of ERC-20 tokens to sign transactions on behalf of the Mech
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

## How it works

## EIP-4337 account

Mechs implement the EIP-4337 [Account](contracts/base/Account.sol) interface meaning they allow bundlers to execute account-abstracted user operations from the Mech's address.

### EIP-1271 signatures

[Mech](contracts/base/Mech.sol) implements the EIP-1271 interface.
It validates that a given ECDSA signature is from the expected account where the expected account is derived using the `isOperator` that inheriting contracts must implement.

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
