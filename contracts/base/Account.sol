// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../interfaces/erc4337/IAccount.sol";

/**
 * @dev This contract provides the basic logic for implementing the ERC4337 IAccount interface
 */
abstract contract Account is IAccount {
    // using UserOperationLib for UserOperation;

    // magic value indicating successfull EIP1271 signature validation.
    bytes4 private constant EIP1271_MAGICVALUE = 0x1626ba7e;

    // return value in case of signature validation success, with no time-range.
    uint256 private constant SIG_VALIDATION_SUCCEEDED = 0;

    // return value in case of signature validation failure, with no time-range.
    uint256 private constant SIG_VALIDATION_FAILED = 1;

    uint256 internal _nonce = 0;

    /**
     * @dev Hard-code the ERC4337 entry point contract address for gas efficiency
     */
    address public constant entryPoint =
        0x0576a174D229E3cFA37253523E645A78A0C91B57;

    /**
     * @dev Returns the account nonce, by default the _nonce field. Child contracts can override this function to provide a different nonce value.
     */
    function nonce() public view virtual returns (uint256) {
        return _nonce;
    }

    /**
     * @dev The central function of the ERC4337 IAccount interface. Checks that the user operation has a valid signature and that the nonce is correct.
     * @param userOp The user operation, including a signature field
     * @param userOpHash The userOpHash is a hash over the userOp (except signature), entryPoint and chainId
     * @param missingAccountFunds The amount of funds that are missing to cover the user operation. This is used to pay the pre-fund to the entry point contract.
     */
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override returns (uint256 validationData) {
        require(
            msg.sender == entryPoint,
            "Only callable from the entry point contract"
        );

        validationData = _validateSignature(userOp, userOpHash);
        if (userOp.initCode.length == 0) {
            _validateAndUpdateNonce(userOp);
        }

        // only pay pre-fund if the signature is valid
        if (address(uint160(validationData)) == address(0)) {
            _payPrefund(missingAccountFunds);
        }
    }

    /**
     * @dev Check if the signature is valid for this user operation. Child contracts can override this function to provide a different signature validation logic.
     * @param userOp The user operation, including the signature field
     * @param userOpHash The hash of the user operation to check the signature against (also hashes the entry point and chain id)
     * @return validationData Signature validation result and validity time-range
     *      <20-byte> sigAuthorizer - 0 for valid signature, 1 to mark signature failure,
     *         otherwise, an address of an "authorizer" contract.
     *      <6-byte> validUntil - last timestamp this operation is valid. 0 for "indefinite"
     *      <6-byte> validAfter - first timestamp this operation is valid
     *      If the account doesn't use time-range, it is enough to return SIG_VALIDATION_FAILED value (1) for signature failure.
     *      Note that the validation code cannot use block.timestamp (or block.number) directly.
     */
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view virtual returns (uint256 validationData) {
        bytes32 hash = ECDSA.toEthSignedMessageHash(userOpHash);
        if (isValidSignature(hash, userOp.signature) != EIP1271_MAGICVALUE) {
            return SIG_VALIDATION_FAILED;
        }
        return SIG_VALIDATION_SUCCEEDED;
    }

    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) public view virtual returns (bytes4 magicValue);

    /**
     * @dev Validate the current nonce matches the UserOperation nonce, then increment nonce to prevent replay of this user operation.
     * Called only if initCode is empty (since "nonce" field is used as "salt" on account creation)
     * @param userOp The user operation to validate.
     */
    function _validateAndUpdateNonce(
        UserOperation calldata userOp
    ) internal virtual {
        require(_nonce++ == userOp.nonce, "Invalid nonce");
    }

    /**
     * @dev Sends missing funds for executing a user operation to the entry point (msg.sender)
     * @param missingAccountFunds the minimum value this method should send the entry point.
     *  This value MAY be zero, in case there is enough deposit, or the userOp has a paymaster.
     */
    function _payPrefund(uint256 missingAccountFunds) internal {
        if (missingAccountFunds != 0) {
            (bool success, ) = payable(msg.sender).call{
                value: missingAccountFunds,
                gas: type(uint256).max
            }("");
            (success);
            //ignore failure (its EntryPoint's job to verify, not ours.)
        }
    }
}
