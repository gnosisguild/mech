//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@erc6551/reference/src/interfaces/IERC6551Account.sol";

import "./Mech.sol";
import "../libraries/MinimalProxyStore.sol";

/**
 * @dev A Mech that is operated by the holder of a designated token, implements the ERC6551 standard and is deployed through the ERC6551 registry
 */
abstract contract TokenboundMech is Mech, IERC6551Account {
    error OwnershipCycle();

    /// @dev Returns the current account nonce
    function state() external view returns (uint256) {
        return entryPoint().getNonce(address(this), 0);
    }

    function token()
        external
        view
        returns (uint256 chainId, address tokenContract, uint256 tokenId)
    {
        return
            abi.decode(
                MinimalProxyStore.getContext(address(this)),
                (uint256, address, uint256)
            );
    }

    receive() external payable override(Receiver, IERC6551Account) {}

    /**
     * @dev EIP-6551 compatibility: Returns a magic value indicating whether a given signer is authorized to act on behalf
     * of the account
     * @param  signer     The address to check signing authorization for
     * @return magicValue Magic value indicating whether the signer is valid
     */
    function isValidSigner(
        address signer,
        bytes calldata
    ) external view returns (bytes4 magicValue) {
        return
            isOperator(signer)
                ? IERC6551Account.isValidSigner.selector
                : bytes4(0);
    }
}
