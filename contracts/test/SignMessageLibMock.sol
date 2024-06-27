// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

contract SignMessageLibMock {
    event SignMessage(bytes data, address thisAddress);

    /**
     * @param _data Arbitrary length data that should be marked as signed on the behalf of address(this).
     */
    function signMessage(bytes calldata _data) external {
        emit SignMessage(_data, address(this));
    }
}
