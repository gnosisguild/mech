//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@gnosis.pm/safe-contracts/contracts/common/Enum.sol";
import "./IFactoryFriendly.sol";

interface IClubCard is IERC1271, IFactoryFriendly {
    /// @dev Executes either a delegatecall or a call with provided parameters
    /// @param to Destination address.
    /// @param value Ether value.
    /// @param data Data payload.
    /// @param operation Operation type.
    /// @return success boolean flag indicating if the call succeeded
    function exec(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) external returns (bool success);

    /// @dev Allows a the card holder to execute arbitrary transaction
    /// @param to Destination address of transaction.
    /// @param value Ether value of transaction.
    /// @param data Data payload of transaction.
    /// @param operation Operation type of transaction.
    /// @return success boolean flag indicating if the call succeeded
    /// @return returnData Return data of the call
    function execReturnData(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) external returns (bool success, bytes memory returnData);
}
