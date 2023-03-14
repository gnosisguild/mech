//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./base/Mech.sol";
import "./base/ImmutableStorage.sol";

/**
 * @dev A Mech that is operated by the holder of a defined set of minimum ERC1155 token balances
 */
contract ERC1155Mech is Mech, ImmutableStorage {
    IERC1155 public token;
    uint256[] public tokenIds;
    uint256[] public minBalances;

    /// @param _token Address of the token contract
    /// @param _tokenIds The token IDs
    /// @param _minBalances The minimum balances required for each token ID
    constructor(
        address _token,
        uint256[] memory _tokenIds,
        uint256[] memory _minBalances
    ) {
        bytes memory initParams = abi.encode(_token, _tokenIds, _minBalances);
        setUp(initParams);
    }

    function setUp(bytes memory initParams) public override {
        require(readImmutable().length == 0, "Already initialized");

        (
            address _token,
            uint256[] memory _tokenIds,
            uint256[] memory _minBalances
        ) = abi.decode(initParams, (address, uint256[], uint256[]));

        require(_tokenIds.length > 0, "No token IDs provided");
        require(_tokenIds.length == _minBalances.length, "Length mismatch");

        token = IERC1155(_token);
        tokenIds = _tokenIds;
        minBalances = _minBalances;
    }

    function isOperator(address signer) public view override returns (bool) {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (token.balanceOf(signer, tokenIds[i]) < minBalances[i]) {
                return false;
            }
        }
        return true;
    }
}
