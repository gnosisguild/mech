//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./base/TokenboundMech.sol";

/**
 * @dev A Mech that is operated by the holder of an ERC721 non-fungible token
 */
contract ERC721TokenboundMech is TokenboundMech {
    function isOperator(address signer) public view override returns (bool) {
        (, address tokenContract, uint256 tokenId) = token();
        return
            IERC721(tokenContract).ownerOf(tokenId) == signer &&
            signer != address(0);
    }

    function onERC721Received(
        address,
        address,
        uint256 receivedTokenId,
        bytes calldata
    ) external view override returns (bytes4) {
        (, address boundTokenContract, uint256 boundTokenId) = token();

        if (
            msg.sender == boundTokenContract && receivedTokenId == boundTokenId
        ) {
            revert OwnershipCycle();
        }

        return 0x150b7a02;
    }
}
