//SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.9;

import "@gnosis.pm/zodiac/contracts/interfaces/IAvatar.sol";
import "@gnosis.pm/safe-contracts/contracts/common/Enum.sol";
import "./MechBase.sol";

/**
 * @dev A Mech that is operated by zodiac modules
 */
contract ZodiacMech is MechBase, IAvatar {
    address internal constant SENTINEL_MODULES = address(0x1);
    mapping(address => address) internal modules;

    /// @dev `module` is already disabled.
    error AlreadyDisabledModule(address module);

    ///@dev `module` is already enabled.
    error AlreadyEnabledModule(address module);

    /// @dev `module` is not a valid address
    error InvalidModule(address module);

    /// @dev `setModules()` was already called.
    error SetupModulesAlreadyCalled();

    /// @param _modules Address of the token contract
    constructor(address[] memory _modules) {
        bytes memory initParams = abi.encode(_modules);
        setUp(initParams);
    }

    /// @dev This function can be called whenever no modules are enabled, meaning anyone could come and call setUp() then. We keep this behavior to not brick the mech in that case.
    function setUp(bytes memory initParams) public override {
        require(
            modules[address(SENTINEL_MODULES)] == address(0),
            "Already initialized"
        );

        modules[SENTINEL_MODULES] = SENTINEL_MODULES;

        address[] memory _modules = abi.decode(initParams, (address[]));

        for (uint256 i = 0; i < _modules.length; i++) {
            _enableModule(_modules[i]);
        }
    }

    function isOperator(address signer) public view override returns (bool) {
        return isModuleEnabled(signer);
    }

    /// @dev Passes a transaction to the avatar.
    /// @notice Can only be called by enabled modules.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of mo  dule transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction.
    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes calldata data,
        Enum.Operation operation
    ) public returns (bool success) {
        return exec(to, value, data, operation);
    }

    /// @dev Passes a transaction to the avatar, expects return data.
    /// @notice Can only be called by enabled modules.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction.
    function execTransactionFromModuleReturnData(
        address to,
        uint256 value,
        bytes calldata data,
        Enum.Operation operation
    ) public returns (bool success, bytes memory returnData) {
        return execReturnData(to, value, data, operation);
    }

    /// @dev Disables a module on the modifier.
    /// @notice This can only be called by the owner.
    /// @param prevModule Module that pointed to the module to be removed in the linked list.
    /// @param module Module to be removed.
    function disableModule(
        address prevModule,
        address module
    ) public override onlyOperator {
        if (module == address(0) || module == SENTINEL_MODULES)
            revert InvalidModule(module);
        if (modules[prevModule] != module) revert AlreadyDisabledModule(module);
        modules[prevModule] = modules[module];
        modules[module] = address(0);
        emit DisabledModule(module);
    }

    /// @dev Enables a module that can add transactions to the queue
    /// @param module Address of the module to be enabled
    /// @notice This can only be called by the owner
    function _enableModule(address module) internal {
        if (module == address(0) || module == SENTINEL_MODULES)
            revert InvalidModule(module);
        if (modules[module] != address(0)) revert AlreadyEnabledModule(module);
        modules[module] = modules[SENTINEL_MODULES];
        modules[SENTINEL_MODULES] = module;
        emit EnabledModule(module);
    }

    /// @dev Enables a module that can add transactions to the queue
    /// @param module Address of the module to be enabled
    /// @notice This can only be called by the owner
    function enableModule(address module) public override onlyOperator {
        _enableModule(module);
    }

    /// @dev Returns if an module is enabled
    /// @return True if the module is enabled
    function isModuleEnabled(
        address _module
    ) public view override returns (bool) {
        return SENTINEL_MODULES != _module && modules[_module] != address(0);
    }

    /// @dev Returns array of modules.
    /// @param start Start of the page.
    /// @param pageSize Maximum number of modules that should be returned.
    /// @return array Array of modules.
    /// @return next Start of the next page.
    function getModulesPaginated(
        address start,
        uint256 pageSize
    ) external view override returns (address[] memory array, address next) {
        /// Init array with max page size.
        array = new address[](pageSize);

        /// Populate return array.
        uint256 moduleCount = 0;
        address currentModule = modules[start];
        while (
            currentModule != address(0x0) &&
            currentModule != SENTINEL_MODULES &&
            moduleCount < pageSize
        ) {
            array[moduleCount] = currentModule;
            currentModule = modules[currentModule];
            moduleCount++;
        }
        next = currentModule;
        /// Set correct size of returned array.
        // solhint-disable-next-line no-inline-assembly
        assembly {
            mstore(array, moduleCount)
        }
    }
}
