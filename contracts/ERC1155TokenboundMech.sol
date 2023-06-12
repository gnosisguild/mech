//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./base/TokenboundMech.sol";

/**
 * @dev A Mech that is operated by the holder of a designated ERC1155 token
 */
contract ERC1155TokenboundMech is TokenboundMech {
    function isOperator(address signer) public view override returns (bool) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = this
            .token();
        if (chainId != block.chainid) return false;
        return IERC1155(tokenContract).balanceOf(signer, tokenId) > 0;
    }

    function owner() public view virtual override returns (address) {
        return address(0);
    }
}
