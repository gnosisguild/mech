//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20("ERC20Token", "ERC20T") {
    function mintToken(address recipient, uint256 amount) public {
        _mint(recipient, amount);
    }
}
