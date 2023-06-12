//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@erc6551/reference/src/interfaces/IERC6551Account.sol";

import "./Mech.sol";
import "../libraries/MinimalProxyStore.sol";

/**
 * @dev A Mech that is operated by the holder of a designated token, implements the ERC6551 standard and is deployed through the ERC6551 registry
 */
abstract contract TokenboundMech is Mech, IERC6551Account {
    function isOperator(
        address signer
    ) public view virtual override returns (bool) {
        return owner() == signer && signer != address(0);
    }

    function executeCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external payable returns (bytes memory) {
        return exec(to, value, data, Enum.Operation.Call, 0);
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

    function owner() public view virtual returns (address);

    // required by ERC-6551, even though their account (https://github.com/tokenbound/contracts/blob/main/src/Account.sol) does not use it but a time-locking mechanism
    // TODO adopt whatever ERC-6551 will settle on
    function nonce() external pure returns (uint256) {
        return 0;
    }

    receive() external payable override(Receiver, IERC6551Account) {}
}
