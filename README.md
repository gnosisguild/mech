# ClubCard

Programmable ownership

#### Transferrable ownership

- [ClubCardERC721.sol](contracts/ClubCardERC721.sol): allow the holder of a designated ERC-721 NFT to sign transactions

#### Threshold ownership

- [ClubCardERC20.sol](contracts/ClubCardERC20.sol): allow holders of a minimum balance of ERC-20 tokens to sign transactions
- [ClubCardERC1155.sol](contracts/ClubCardERC1155.sol): allow holders of a minimum balance of ERC-1155 tokens to sign transactions

#### Programmable ownership

- [ClubCardBase.sol](contracts/ClubCardBase.sol): implement custom ownership terms by extending this abstract contract

## EIP-1271 signatures

[ClubCardBase](contracts/ClubCardBase.sol) implements the EIP-1271 interface.
It validates that a given ECDSA signature is from the expected account where the expected account is derived using the `isCardHolder` that inheriting contracts must implement.

Additionally, it supports validation of EIP-1271 contract signatures, which are expected to be given in the following format based on ECDSA {r, s, v} components with `v = 0` as the recovery identifier:

```
0x000000000000000000000000<20 bytes smart contract address>>>>>>>>  // r component: the address of signing EIP-1271 contract
  0000000000000000000000000000000000000000000000000000000000000041  // s component: constant 65 bytes offset to signature data
  00                                                                // v component: constant unpadded `0` as recovery identifier
  00000000000000000000000000000000<length of signature data bytes>
  <bytes of signature data ....>
```
