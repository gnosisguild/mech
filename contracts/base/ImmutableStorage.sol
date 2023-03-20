// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "hardhat/console.sol";
import "../libraries/WriteOnce.sol";

contract ImmutableStorage {
    /**
     * @return The address the data is written to
     */
    function storageLocation() internal view returns (address) {
        // calculates the address of the contract created through the first create() call made by this contract
        // see: https://ethereum.stackexchange.com/a/761
        return
            address(
                uint160(
                    uint256(
                        keccak256(
                            abi.encodePacked(
                                bytes1(0xd6),
                                bytes1(0x94),
                                address(this),
                                bytes1(0x01) // contracts start with nonce 1 (EIP-161)
                            )
                        )
                    )
                )
            );
    }

    /**
     * Stores `data` and validates that it's written to the expected storage location
     * @param data to be written
     */
    function writeImmutable(bytes memory data) internal {
        bytes memory initCode = WriteOnce.creationCodeFor(data);
        address createdAt;

        // Deploy contract using create
        assembly {
            createdAt := create(0, add(initCode, 32), mload(initCode))
        }

        require(createdAt == storageLocation(), "Write failed");
    }

    /**
     * Reads the code at the storage location as data
     * @return data stored at the storage location
     */
    function readImmutable() internal view returns (bytes memory) {
        return WriteOnce.valueStoredAt(storageLocation());
    }
}
