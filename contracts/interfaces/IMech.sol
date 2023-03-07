//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@gnosis.pm/safe-contracts/contracts/common/Enum.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";

import "./IFactoryFriendly.sol";

interface IMech is IAccount, IERC1271, IFactoryFriendly {
    /// @dev Executes either a delegatecall or a call with provided parameters
    /// @param to Destination address.
    /// @param value Ether value.
    /// @param data Data payload.
    /// @param operation Operation type.
    /// @param txGas Gas to send for executing the meta transaction, if 0 all left will be sent
    /// @return returnData bytes The return data of the call
    function exec(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        uint256 txGas
    ) external returns (bytes memory returnData);
}
