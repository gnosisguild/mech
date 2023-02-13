//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./ClubCardBase.sol";

contract ClubCardERC721 is ClubCardBase {
    IERC721 public token;
    uint256 public tokenId;

    /// @param _token Address of the token contract
    /// @param _tokenId The token ID
    constructor(address _token, uint256 _tokenId) {
        bytes memory initParams = abi.encode(_token, _tokenId);
        setUp(initParams);
    }

    function setUp(bytes memory initParams) public override {
        require(address(token) == address(0), "Already initialized");

        (address _token, uint256 _tokenId) = abi.decode(
            initParams,
            (address, uint256)
        );

        token = IERC721(_token);
        tokenId = _tokenId;
    }

    function isCardHolder(address signer) public view override returns (bool) {
        return token.ownerOf(tokenId) == signer;
    }
}
