//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@gnosis.pm/safe-contracts/contracts/common/Enum.sol";

import "./interfaces/IClubCard.sol";

/**
 * @dev This contract implements the authorization and signature validation for a club card. It's unopinionated about what it means to hold a club card. Child contract must define that by implementing the `isCardHolder` function.
 */
abstract contract ClubCardBase is IClubCard {
    // bytes4(keccak256("isValidSignature(bytes32,bytes)")
    bytes4 internal constant EIP1271_MAGICVALUE = 0x1626ba7e;

    modifier onlyCardHolder() {
        require(
            isCardHolder(msg.sender),
            "Only callable by the club card holder"
        );
        _;
    }

    /**
     * @dev Return if the passed address is authorized to sign on behalf of the club card, must be implemented by the child contract
     * @param signer The address to check
     */
    function isCardHolder(address signer) public view virtual returns (bool);

    /**
     * @dev Checks whether the signature provided is valid for the provided hash, complies with EIP-1271
     * @param hash Hash of the data (could be either a message hash or transaction hash)
     * @param signature Signature to validate. Can be an ECDSA signature or a EIP-1271 contract signature (identified by v=0)
     */
    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) external view returns (bytes4 magicValue) {
        bytes32 r;
        bytes32 s;
        uint8 v;
        (v, r, s) = splitSignature(signature);

        if (v == 0) {
            // This is an EIP-1271 contract signature
            // The address of the contract is encoded into r
            address signingContract = address(uint160(uint256(r)));

            require(
                isCardHolder(signingContract),
                "signing contract does not hold this club card"
            );

            // The signature data to pass for validation to the contract is appended to the signature and the offset is stored in s
            bytes memory contractSignature;
            // solhint-disable-next-line no-inline-assembly
            assembly {
                contractSignature := add(add(signature, s), 0x20)
            }
            return IERC1271(signingContract).isValidSignature(hash, signature);
        } else {
            // This is an ECDSA signature
            if (isCardHolder(ECDSA.recover(hash, v, r, s))) {
                return EIP1271_MAGICVALUE;
            }
        }

        return 0xffffffff;
    }

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
    ) public onlyCardHolder returns (bool success) {
        if (operation == Enum.Operation.DelegateCall) {
            // solhint-disable-next-line no-inline-assembly
            assembly {
                success := delegatecall(
                    gas(),
                    to,
                    add(data, 0x20),
                    mload(data),
                    0,
                    0
                )
            }
        } else {
            // solhint-disable-next-line no-inline-assembly
            assembly {
                success := call(
                    gas(),
                    to,
                    value,
                    add(data, 0x20),
                    mload(data),
                    0,
                    0
                )
            }
        }
    }

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
    ) public onlyCardHolder returns (bool success, bytes memory returnData) {
        success = exec(to, value, data, operation);
        // solhint-disable-next-line no-inline-assembly
        assembly {
            // Load free memory location
            let ptr := mload(0x40)
            // We allocate memory for the return data by setting the free memory location to
            // current free memory location + data size + 32 bytes for data size value
            mstore(0x40, add(ptr, add(returndatasize(), 0x20)))
            // Store the size
            mstore(ptr, returndatasize())
            // Store the data
            returndatacopy(add(ptr, 0x20), 0, returndatasize())
            // Point the return data to the correct memory location
            returnData := ptr
        }
    }

    /**
     * @dev Divides bytes signature into `uint8 v, bytes32 r, bytes32 s`.
     * @param signature The signature bytes
     */
    function splitSignature(
        bytes memory signature
    ) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
        // The signature format is a compact form of:
        //   {bytes32 r}{bytes32 s}{uint8 v}
        // Compact means, uint8 is not padded to 32 bytes.
        // solhint-disable-next-line no-inline-assembly
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
    }
}
