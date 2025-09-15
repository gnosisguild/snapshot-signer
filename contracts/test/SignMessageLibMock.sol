// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// import is here only so that hardhat makes a contract factory for the original SignMessageLib
import "@safe-global/safe-contracts/contracts/libraries/SignMessageLib.sol";

contract SignMessageLibMock {
    event SignMessage(bytes data, address thisAddress);

    /**
     * @param _data Arbitrary length data that should be marked as signed on the behalf of address(this).
     */
    function signMessage(bytes calldata _data) external {
        emit SignMessage(_data, address(this));
    }
}
