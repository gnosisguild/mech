//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@erc6551/reference/src/interfaces/IERC6551Account.sol";
import "@erc6551/reference/src/lib/ERC6551AccountLib.sol";

import "./base/Mech.sol";

/**
 * @dev A Mech that is operated by the holder of an ERC721 non-fungible token, implements the ERC6551 standard
 */
contract ERC721Mech is Mech, IERC6551Account {
    /// @param _token Address of the token contract
    /// @param _tokenId The token ID
    constructor(address _token, uint256 _tokenId) {
        bytes memory initParams = abi.encode(_token, _tokenId);
        setUp(initParams);
    }

    function setUp(bytes memory initParams) public override {
        require(readImmutable().length == 0, "Already initialized");
        writeImmutable(initParams);
    }

    function isOperator(address signer) public view override returns (bool) {
        return owner() == signer && signer != address(0);
    }

    function executeCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external payable returns (bytes memory) {
        return exec(to, value, data, Enum.Operation.Call, 0);
    };

    function token()
        external
        view
        returns (uint256 chainId, address tokenContract, uint256 tokenId)
    {
        return ERC6551AccountLib.token();
    }

    function owner() external view returns (address) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = this.token();
        if (chainId != block.chainid) return address(0);

        return IERC721(tokenContract).ownerOf(tokenId);
    }; 
}
