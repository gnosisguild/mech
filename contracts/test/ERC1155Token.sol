//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract ERC1155Token is ERC1155("ERC1155Token") {
    function mintToken(
        address recipient,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public {
        _mint(recipient, id, amount, data);
    }
}
