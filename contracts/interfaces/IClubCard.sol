//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "./ISafe.sol";

interface IClubCard is IERC1271 {
  /// @dev Allows to execute a Safe transaction confirmed by required number of owners and then pays the account that submitted the transaction.
  ///      Note: The fees are always transferred, even if the user transaction fails.
  /// @param to Destination address of Safe transaction.
  /// @param value Ether value of Safe transaction.
  /// @param data Data payload of Safe transaction.
  /// @param operation Operation type of Safe transaction.
  /// @param safeTxGas Gas that should be used for the Safe transaction.
  /// @param baseGas Gas costs that are independent of the transaction execution(e.g. base transaction fee, signature check, payment of the refund)
  /// @param gasPrice Gas price that should be used for the payment calculation.
  /// @param gasToken Token address (or 0 if ETH) that is used for the payment.
  /// @param refundReceiver Address of receiver of gas payment (or 0 if tx.origin).
  /// @param signatures Packed signature data ({bytes32 r}{bytes32 s}{uint8 v})
  function execTransaction(
    address payable from,
    address to,
    uint256 value,
    bytes calldata data,
    ISafe.Operation operation,
    uint256 safeTxGas,
    uint256 baseGas,
    uint256 gasPrice,
    address gasToken,
    address payable refundReceiver,
    bytes memory signatures
  ) external returns (bool success);

  /**
   * @dev Marks the hash of a transaction from the specified Safe as approved.
   * @param from The address of the Safe from which the transaction is executed.
   * @param hashToApprove The hash that should be marked as approved for signatures that are verified by this contract.
   */
  function approveHash(address payable from, bytes32 hashToApprove) external;
}
