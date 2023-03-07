// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.12;

import "@gnosis.pm/safe-contracts/contracts/interfaces/ERC721TokenReceiver.sol";
import "@gnosis.pm/safe-contracts/contracts/interfaces/ERC1155TokenReceiver.sol";
import "@gnosis.pm/safe-contracts/contracts/interfaces/ERC777TokensRecipient.sol";

/**
 * @dev This contract implements the functions necessary to receive ether as well as ERC721, ERC1155 and ERC777 tokens.
 */
contract Receiver is
    ERC1155TokenReceiver,
    ERC777TokensRecipient,
    ERC721TokenReceiver
{
    receive() external payable {}

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return 0xf23a6e61;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return 0xbc197c81;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return 0x150b7a02;
    }

    function tokensReceived(
        address,
        address,
        address,
        uint256,
        bytes calldata,
        bytes calldata
    ) external pure override {
        // for ERC-777 compatibility
    }
}
