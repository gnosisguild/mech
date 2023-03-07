//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Token is ERC721("ERC721Token", "ERC721T") {
    function mintToken(address recipient, uint256 tokenId) public {
        _mint(recipient, tokenId);
    }
}
