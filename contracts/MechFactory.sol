// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.0;

import "./libraries/MinimalProxyStore.sol";

contract MechFactory {
    event MechCreated(
        address indexed proxy,
        address indexed mastercopy,
        bytes context
    );

    /// `target` can not be zero.
    error ZeroAddress(address target);

    /// `target` has no code deployed.
    error TargetHasNoCode(address target);

    /// `target` is already taken.
    error TakenAddress(address target);

    /// @notice Initialization failed.
    error FailedInitialization();

    function createProxy(
        address target,
        bytes memory context,
        bytes32 salt
    ) internal returns (address result) {
        if (address(target) == address(0)) revert ZeroAddress(target);
        if (address(target).code.length == 0) revert TargetHasNoCode(target);

        address proxy = MinimalProxyStore.cloneDeterministic(
            target,
            context,
            salt
        );

        emit MechCreated(proxy, target, context);

        return proxy;
    }

    function deployMech(
        address mastercopy,
        bytes memory context,
        bytes memory initialCall,
        bytes32 salt
    ) public returns (address proxy) {
        proxy = createProxy(mastercopy, context, salt);

        if (initialCall.length > 0) {
            (bool success, ) = proxy.call(initialCall);
            if (!success) revert FailedInitialization();
        }
    }
}
