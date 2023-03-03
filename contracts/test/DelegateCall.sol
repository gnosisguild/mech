//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.9;

contract DelegateCall {
    address private immutable ownAddress;

    constructor() {
        ownAddress = address(this);
    }

    function test() public view {
        require(
            address(this) != ownAddress,
            "Can only be called via delegatecall"
        );
    }
}
