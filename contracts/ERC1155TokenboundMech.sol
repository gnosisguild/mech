//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./base/TokenboundMech.sol";

/**
 * @dev A Mech that is operated by the holder of a designated ERC1155 token
 */
contract ERC1155TokenboundMech is TokenboundMech {
    function isOperator(address signer) public view override returns (bool) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = token();
        if (chainId != block.chainid) return false;
        return IERC1155(tokenContract).balanceOf(signer, tokenId) > 0;
    }

    function onERC1155Received(
        address,
        address from,
        uint256 receivedTokenId,
        uint256,
        bytes calldata
    ) external view override returns (bytes4) {
        (
            uint256 chainId,
            address boundTokenContract,
            uint256 boundTokenId
        ) = token();

        if (
            chainId == block.chainid &&
            msg.sender == boundTokenContract &&
            receivedTokenId == boundTokenId
        ) {
            // We block the transfer only if the sender has no balance left after the transfer.
            // Note: ERC-1155 prescribes that balances are updated BEFORE the call to onERC1155Received.
            if (
                IERC1155(boundTokenContract).balanceOf(from, boundTokenId) == 0
            ) {
                revert OwnershipCycle();
            }
        }

        return 0xf23a6e61;
    }

    function onERC1155BatchReceived(
        address,
        address from,
        uint256[] calldata ids,
        uint256[] calldata,
        bytes calldata
    ) external view override returns (bytes4) {
        (
            uint256 chainId,
            address boundTokenContract,
            uint256 boundTokenId
        ) = token();

        if (chainId == block.chainid && msg.sender == boundTokenContract) {
            // We block the transfer only if the sender has no balance left after the transfer.
            // Note: ERC-1155 prescribes that balances are updated BEFORE the call to onERC1155BatchReceived.
            for (uint256 i = 0; i < ids.length; i++) {
                if (ids[i] == boundTokenId) {
                    if (
                        IERC1155(boundTokenContract).balanceOf(
                            from,
                            boundTokenId
                        ) == 0
                    ) {
                        revert OwnershipCycle();
                    }
                }
            }
        }

        return 0xbc197c81;
    }
}
