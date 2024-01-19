// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "@safe-global/safe-contracts/contracts/libraries/SafeStorage.sol";

contract SafeMock is SafeStorage {
    receive() external payable {}

    function exec(address payable to, uint256 value, bytes calldata data, uint8 operation) external {
        bool success;
        bytes memory response;
        if (operation == 1) (success, response) = to.delegatecall(data);
        else (success, response) = to.call{ value: value }(data);
        if (!success) {
            assembly {
                revert(add(response, 0x20), mload(response))
            }
        }
    }

    /** allow getting call results */
    function execResult(
        address payable to,
        uint256 value,
        bytes calldata data,
        uint8 operation
    ) external returns (bytes memory response) {
        bool success;
        if (operation == 1) (success, response) = to.delegatecall(data);
        else (success, response) = to.call{ value: value }(data);
        if (!success) {
            assembly {
                revert(add(response, 0x20), mload(response))
            }
        }
        return response;
    }

    /** allow querying signed messages from Safe storage */
    function getSignedMessage(bytes32 messageHash) external view returns (uint256) {
        return signedMessages[messageHash];
    }

    /** required because the SignMessageLib calls back to this function */
    function domainSeparator() public pure returns (bytes32) {
        return keccak256(bytes("SafeMock"));
    }
}
