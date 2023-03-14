//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "../base/ImmutableStorage.sol";

contract ImmutableStorageTest is ImmutableStorage {
    function read() public view returns (bytes memory data) {
        return readImmutable();
    }

    function write(bytes memory data) public {
        writeImmutable(data);
    }
}
