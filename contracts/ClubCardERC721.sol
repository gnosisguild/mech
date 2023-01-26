//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./interfaces/IClubCard.sol";
import "./interfaces/ISafe.sol";

contract ClubCardERC721 is IClubCard {
  // bytes4(keccak256("isValidSignature(bytes32,bytes)")
  bytes4 internal constant IERC1271_MAGICVALUE = 0x1626ba7e;

  IERC721 public token;
  uint256 public tokenId;

  modifier onlyHolder() {
    require(
      token.ownerOf(tokenId) == msg.sender,
      "Only callable by the token owner of the token"
    );
    _;
  }

  constructor(address _token, uint256 _tokenId) {
    token = IERC721(_token);
    tokenId = _tokenId;
  }

  function isValidSignature(
    bytes32 hash,
    bytes memory signature
  ) external view returns (bytes4 magicValue) {
    if (ECDSA.recover(hash, signature) == token.ownerOf(tokenId)) {
      return IERC1271_MAGICVALUE;
    } else {
      return 0xffffffff;
    }
  }

  function execTransaction(
    address payable from,
    address to,
    uint256 value,
    bytes calldata data,
    ISafe.Operation operation,
    uint256 safeTxGas,
    uint256 baseGas,
    uint256 gasPrice,
    address gasToken,
    address payable refundReceiver,
    bytes memory signatures
  ) external onlyHolder returns (bool success) {
    return
      ISafe(from).execTransaction(
        to,
        value,
        data,
        operation,
        safeTxGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
        signatures
      );
  }

  function approveHash(
    address payable from,
    bytes32 hashToApprove
  ) external onlyHolder {
    ISafe(from).approveHash(hashToApprove);
  }
}
