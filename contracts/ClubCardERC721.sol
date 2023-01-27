//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./ClubCardBase.sol";

contract ClubCardERC721 is ClubCardBase {
  IERC721 public token;
  uint256 public tokenId;

  constructor(address _token, uint256 _tokenId) {
    token = IERC721(_token);
    tokenId = _tokenId;
  }

  function isCardHolder(address signer) public view override returns (bool) {
    return token.ownerOf(tokenId) == signer;
  }
}
