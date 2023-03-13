//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./base/Mech.sol";

/**
 * @dev A Mech that is operated by the holder of a defined set of minimum ERC1155 token balances
 */
contract ERC1155Mech is Mech {
    uint256 private constant MAX_LENGTH = 16;

    IERC1155 public immutable token;

    // This is our workaround for immutable arrays (see: https://github.com/ethereum/solidity/issues/12587)
    uint256 internal immutable tokenId0;
    uint256 internal immutable tokenId1;
    uint256 internal immutable tokenId2;
    uint256 internal immutable tokenId3;
    uint256 internal immutable tokenId4;
    uint256 internal immutable tokenId5;
    uint256 internal immutable tokenId6;
    uint256 internal immutable tokenId7;
    uint256 internal immutable tokenId8;
    uint256 internal immutable tokenId9;
    uint256 internal immutable tokenId10;
    uint256 internal immutable tokenId11;
    uint256 internal immutable tokenId12;
    uint256 internal immutable tokenId13;
    uint256 internal immutable tokenId14;
    uint256 internal immutable tokenId15;

    uint256 internal immutable minBalance0;
    uint256 internal immutable minBalance1;
    uint256 internal immutable minBalance2;
    uint256 internal immutable minBalance3;
    uint256 internal immutable minBalance4;
    uint256 internal immutable minBalance5;
    uint256 internal immutable minBalance6;
    uint256 internal immutable minBalance7;
    uint256 internal immutable minBalance8;
    uint256 internal immutable minBalance9;
    uint256 internal immutable minBalance10;
    uint256 internal immutable minBalance11;
    uint256 internal immutable minBalance12;
    uint256 internal immutable minBalance13;
    uint256 internal immutable minBalance14;
    uint256 internal immutable minBalance15;

    uint256 internal immutable length;

    /// @param _token Address of the token contract
    /// @param _tokenIds The token IDs
    /// @param _minBalances The minimum balances required for each token ID
    constructor(
        address _token,
        uint256[] memory _tokenIds,
        uint256[] memory _minBalances
    ) {
        length = _tokenIds.length;
        require(length > 0, "No token IDs provided");
        require(length <= MAX_LENGTH, "A maximum of 16 token IDs is supported");
        require(length == _minBalances.length, "Length mismatch");

        token = IERC1155(_token);

        tokenId0 = _tokenIds[0];
        minBalance0 = _minBalances[0];

        tokenId1 = length > 1 ? _tokenIds[1] : 0;
        minBalance1 = length > 1 ? _minBalances[1] : 0;

        tokenId2 = length > 2 ? _tokenIds[2] : 0;
        minBalance2 = length > 2 ? _minBalances[2] : 0;

        tokenId3 = length > 3 ? _tokenIds[3] : 0;
        minBalance3 = length > 3 ? _minBalances[3] : 0;

        tokenId4 = length > 4 ? _tokenIds[4] : 0;
        minBalance4 = length > 4 ? _minBalances[4] : 0;

        tokenId5 = length > 5 ? _tokenIds[5] : 0;
        minBalance5 = length > 5 ? _minBalances[5] : 0;

        tokenId6 = length > 6 ? _tokenIds[6] : 0;
        minBalance6 = length > 6 ? _minBalances[6] : 0;

        tokenId7 = length > 7 ? _tokenIds[7] : 0;
        minBalance7 = length > 7 ? _minBalances[7] : 0;

        tokenId8 = length > 8 ? _tokenIds[8] : 0;
        minBalance8 = length > 8 ? _minBalances[8] : 0;

        tokenId9 = length > 9 ? _tokenIds[9] : 0;
        minBalance9 = length > 9 ? _minBalances[9] : 0;

        tokenId10 = length > 10 ? _tokenIds[10] : 0;
        minBalance10 = length > 10 ? _minBalances[10] : 0;

        tokenId11 = length > 11 ? _tokenIds[11] : 0;
        minBalance11 = length > 11 ? _minBalances[11] : 0;

        tokenId12 = length > 12 ? _tokenIds[12] : 0;
        minBalance12 = length > 12 ? _minBalances[12] : 0;

        tokenId13 = length > 13 ? _tokenIds[13] : 0;
        minBalance13 = length > 13 ? _minBalances[13] : 0;

        tokenId14 = length > 14 ? _tokenIds[14] : 0;
        minBalance14 = length > 14 ? _minBalances[14] : 0;

        tokenId15 = length > 15 ? _tokenIds[15] : 0;
        minBalance15 = length > 15 ? _minBalances[15] : 0;
    }

    function tokenIds(uint256 index) public view returns (uint256) {
        require(index < length, "Index out of bounds");
        if (index == 0) return tokenId0;
        if (index == 1) return tokenId1;
        if (index == 2) return tokenId2;
        if (index == 3) return tokenId3;
        if (index == 4) return tokenId4;
        if (index == 5) return tokenId5;
        if (index == 6) return tokenId6;
        if (index == 7) return tokenId7;
        if (index == 8) return tokenId8;
        if (index == 9) return tokenId9;
        if (index == 10) return tokenId10;
        if (index == 11) return tokenId11;
        if (index == 12) return tokenId12;
        if (index == 13) return tokenId13;
        if (index == 14) return tokenId14;
        return tokenId15;
    }

    function minBalances(uint256 index) public view returns (uint256) {
        require(index < length, "Index out of bounds");
        if (index == 0) return minBalance0;
        if (index == 1) return minBalance1;
        if (index == 2) return minBalance2;
        if (index == 3) return minBalance3;
        if (index == 4) return minBalance4;
        if (index == 5) return minBalance5;
        if (index == 6) return minBalance6;
        if (index == 7) return minBalance7;
        if (index == 8) return minBalance8;
        if (index == 9) return minBalance9;
        if (index == 10) return minBalance10;
        if (index == 11) return minBalance11;
        if (index == 12) return minBalance12;
        if (index == 13) return minBalance13;
        if (index == 14) return minBalance14;
        return minBalance15;
    }

    function isOperator(address signer) public view override returns (bool) {
        for (uint256 i = 0; i < length; i++) {
            if (token.balanceOf(signer, tokenIds(i)) < minBalances(i)) {
                return false;
            }
        }
        return true;
    }
}
