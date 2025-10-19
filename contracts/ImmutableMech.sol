//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.12;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);
}

abstract contract Initializable {
    bool private _initialized;

    modifier initializer() {
        require(!_initialized, "Already initialized");
        _initialized = true;
        _;
    }
}

contract ImmutableMech is Initializable {
    event ImmutableMechCreated(IERC721 token, uint256 tokenId);

    IERC721 private token;
    uint256 private tokenId;

    modifier onlyOperator() {
        require(
            token.ownerOf(tokenId) == msg.sender,
            "Only callable by the mech operator"
        );
        _;
    }

    constructor() {
        bytes memory initParams = abi.encode(address(0), 0);
        setUp(initParams);
    }

    function setUp(bytes memory initParams) public initializer {
        (address _token, uint256 _tokenId) = abi.decode(
            initParams,
            (address, uint256)
        );

        token = IERC721(_token);
        tokenId = _tokenId;

        emit ImmutableMechCreated(IERC721(_token), _tokenId);
    }

    /// @dev Allows the mech operator to execute arbitrary transactions
    /// @param to Destination address of transaction.
    /// @param value Ether value of transaction.
    /// @param data Data payload of transaction.
    /// @return returnData Return data of the call
    function execute(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation
    ) public payable onlyOperator returns (bytes memory returnData) {
        bool success;

        if (operation == 0) {
            (success, returnData) = to.call{value: value}(data);
        } else if (operation == 1) {
            (success, returnData) = to.delegatecall(data);
        } else {
            revert("Invalid operation");
        }

        if (!success) {
            // solhint-disable-next-line no-inline-assembly
            assembly {
                revert(add(returnData, 0x20), mload(returnData))
            }
        }
    }
}
