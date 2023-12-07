//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./base/ThresholdMech.sol";
import "./libraries/MinimalProxyStore.sol";

/**
 * @dev A Mech that is operated by any holder of a minimum ERC20 token balance
 */
contract ERC20ThresholdMech is ThresholdMech {
    function threshold()
        public
        view
        returns (address token, uint256 minBalance)
    {
        return
            abi.decode(
                MinimalProxyStore.getContext(address(this)),
                (address, uint256)
            );
    }

    function isOperator(address signer) public view override returns (bool) {
        (address token, uint256 minBalance) = threshold();

        return IERC20(token).balanceOf(signer) >= minBalance;
    }
}
