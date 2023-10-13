//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@erc6551/reference/src/interfaces/IERC6551Executable.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";

interface IMech is IAccount, IERC1271, IERC6551Executable {
    /**
     * @dev Return if the passed address is authorized to sign on behalf of the mech, must be implemented by the child contract
     * @param signer The address to check
     */
    function isOperator(address signer) external view returns (bool);

    /// @dev Executes either a delegatecall or a call with provided parameters
    /// @param to Destination address.
    /// @param value Ether value.
    /// @param data Data payload.
    /// @param operation Operation type.
    /// @return returnData bytes The return data of the call
    function execute(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation
    ) external payable returns (bytes memory returnData);

    /// @dev Executes either a delegatecall or a call with provided parameters, with a specified gas limit for the meta transaction
    /// @param to Destination address.
    /// @param value Ether value.
    /// @param data Data payload.
    /// @param operation Operation type.
    /// @param txGas Gas to send for executing the meta transaction, if 0 all left will be sent
    /// @return returnData bytes The return data of the call
    function execute(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation,
        uint256 txGas
    ) external payable returns (bytes memory returnData);
}
