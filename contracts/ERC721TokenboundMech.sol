//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./base/TokenboundMech.sol";

/**
 * @dev A Mech that is operated by the holder of an ERC721 non-fungible token
 */
contract ERC721TokenboundMech is TokenboundMech {
    function isOperator(address signer) public view override returns (bool) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = this
            .token();
        if (chainId != block.chainid) return false;
        return
            IERC721(tokenContract).ownerOf(tokenId) == signer &&
            signer != address(0);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 receivedTokenId,
        bytes calldata
    ) external view override returns (bytes4) {
        (
            uint256 chainId,
            address boundTokenContract,
            uint256 boundTokenId
        ) = this.token();

        if (
            chainId == block.chainid &&
            msg.sender == boundTokenContract &&
            receivedTokenId == boundTokenId
        ) {
            revert OwnershipCycle();
        }

        return 0x150b7a02;
    }
}
