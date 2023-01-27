# Safe ClubCard

Programmable Safe ownership

#### Transferrable ownership

- [ClubCardERC721.sol](contracts/ClubCardERC721.sol): allow the holder of a designated ERC-721 NFT to sign transactions

#### Threshold ownership

- [ClubCardERC20.sol](contracts/ClubCardERC20.sol): allow holders of a minimum balance of ERC-20 tokens to sign transactions
- [ClubCardERC1155.sol](contracts/ClubCardERC1155.sol): allow holders of a minimum balance of ERC-1155 tokens to sign transactions

#### Programmable ownership

- [ClubCardBase.sol](contracts/ClubCardBase.sol): implement custom ownership terms by extending this abstract contract
