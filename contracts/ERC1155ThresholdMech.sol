//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./base/ThresholdMech.sol";
import "./libraries/MinimalProxyStore.sol";

/**
 * @dev A Mech that is operated by any holder of a defined set of minimum ERC1155 token balances
 */
contract ERC1155ThresholdMech is ThresholdMech {
    function threshold()
        public
        view
        returns (
            address token,
            uint256[] memory tokenIds,
            uint256[] memory minBalances,
            uint256 minTotalBalance
        )
    {
        return
            abi.decode(
                MinimalProxyStore.getContext(address(this)),
                (address, uint256[], uint256[], uint256)
            );
    }

    function isOperator(address signer) public view override returns (bool) {
        (
            address token,
            uint256[] memory tokenIds,
            uint256[] memory minBalances,
            uint256 minTotalBalance
        ) = this.threshold();

        uint256 balanceSum = 0;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 balance = IERC1155(token).balanceOf(signer, tokenIds[i]);
            if (balance < minBalances[i]) {
                return false;
            }
            balanceSum += balance;
        }

        return balanceSum >= minTotalBalance;
    }
}
