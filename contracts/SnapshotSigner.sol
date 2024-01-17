// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "@safe-global/safe-contracts/contracts/libraries/SignMessageLib.sol";

contract SnapshotSigner {
    SignMessageLib public immutable signMessageLib;

    error InvalidAddress(address givenAddress);

    struct SnapshotMessage {
        string space;
    }

    constructor(address _signMessageLib) {
        if (_signMessageLib == address(0)) {
            revert InvalidAddress(_signMessageLib);
        }
        signMessageLib = SignMessageLib(_signMessageLib);
    }

    /**
     * @notice Marks a message (`_data`) as signed.
     * @dev TODO
     * @param message The snapshot vote message.
     */
    function signSnapshotMessage(SnapshotMessage calldata message) external {}
}
