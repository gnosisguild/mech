//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "../interfaces/SafeStorage.sol";

/**
 * Migrates a Safe proxy instance to a ZodiacMech
 */
contract SafeMigration is SafeStorage {
    address public immutable migrationSingleton;
    address public immutable zodiacMechMastercopy;

    constructor(address _zodiacMechMastercopy) {
        // Singleton address cannot be zero address.
        require(
            _zodiacMechMastercopy != address(0),
            "Invalid mastercopy address provided"
        );
        zodiacMechMastercopy = _zodiacMechMastercopy;
        migrationSingleton = address(this);
    }

    event ChangedMasterCopy(address singleton);

    /**
     * @notice Migrates the Safe to the Singleton contract at `migrationSingleton`.
     * @dev This can only be called via a delegatecall.
     */
    function migrate() public {
        require(
            address(this) != migrationSingleton,
            "Migration should only be called via delegatecall"
        );

        singleton = zodiacMechMastercopy;
        emit ChangedMasterCopy(singleton);
    }
}
