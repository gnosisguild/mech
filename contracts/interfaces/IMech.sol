//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@gnosis.pm/safe-contracts/contracts/common/Enum.sol";

import "./IFactoryFriendly.sol";

interface IMech is IERC1271, IFactoryFriendly {
    /// @dev Executes either a delegatecall or a call with provided parameters
    /// @param to Destination address.
    /// @param value Ether value.
    /// @param data Data payload.
    /// @param operation Operation type.
    /// @param txGas Gas to send for executing the meta transaction, if 0 all left will be sent
    /// @return success boolean flag indicating if the call succeeded
    function exec(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        uint256 txGas
    ) external returns (bool success);

    /// @dev Allows a the mech operator to execute arbitrary transaction
    /// @param to Destination address of transaction.
    /// @param value Ether value of transaction.
    /// @param data Data payload of transaction.
    /// @param operation Operation type of transaction.
    /// @param txGas Gas to send for executing the meta transaction, if 0 all left will be sent
    /// @return success boolean flag indicating if the call succeeded
    /// @return returnData Return data of the call
    function execReturnData(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        uint256 txGas
    ) external returns (bool success, bytes memory returnData);
}
