// SPDX-License-Identifier: LGPL-3.0-only
// https://github.com/safe-global/safe-contracts/blob/main/contracts/libraries/SafeStorage.sol
pragma solidity >=0.7.0 <0.9.0;

/**
 * Storage layout of the Safe contract
 * @dev Must be always the first base contract
 */
contract SafeStorage {
    address internal singleton;
    mapping(address => address) internal modules;
    mapping(address => address) internal owners;
    uint256 internal ownerCount;
    uint256 internal threshold;

    uint256 internal safeNonce;
    bytes32 internal _deprecatedDomainSeparator;
    mapping(bytes32 => uint256) internal signedMessages;
    mapping(address => mapping(bytes32 => uint256)) internal approvedHashes;
}
