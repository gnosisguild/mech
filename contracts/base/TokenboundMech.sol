//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@erc6551/reference/src/interfaces/IERC6551Account.sol";
import "@erc6551/reference/src/lib/ERC6551AccountLib.sol";

import "./Mech.sol";

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
        public
        view
        returns (uint256 chainId, address tokenContract, uint256 tokenId)
    {
        return ERC6551AccountLib.token();
    }

    receive() external payable override(Receiver, IERC6551Account) {}

    /**
     * @dev Returns a magic value indicating whether a given signer is authorized to act on behalf
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

    function supportsInterface(
        bytes4 interfaceId
    ) public pure override returns (bool) {
        return
            super.supportsInterface(interfaceId) ||
            interfaceId == type(IERC6551Account).interfaceId;
    }
}
