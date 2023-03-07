// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.12;

/// @dev Interface for contracts that can be used as master copies for minimal proxies deployed through Zodiac's ModuleProxyFactory
interface IFactoryFriendly {
    function setUp(bytes memory initializeParams) external;
}
