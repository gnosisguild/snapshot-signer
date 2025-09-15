// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

contract SnapshotSigner {
    address public immutable deployedAt;
    address public immutable signMessageLib;

    error InvalidAddress(address givenAddress);
    error InvalidCall();
    error SignMessageLibCallFailed();

    struct Domain {
        string name;
        string version;
    }
    bytes32 private constant DOMAIN_TYPE_HASH = keccak256("EIP712Domain(string name,string version)");

    // https://github.com/snapshot-labs/sx-monorepo/blob/fbb53dc9061babb740f3b83fcd9ec7e06ab71ac1/packages/sx.js/src/clients/offchain/ethereum-sig/types.ts#L6
    struct BasicVote {
        string from;
        string space;
        uint64 timestamp;
        string proposal;
        uint32 choice;
        string reason;
        string app;
        string metadata;
    }
    bytes32 private constant BASIC_VOTE_TYPE_HASH =
        keccak256(
            "Vote(string from,string space,uint64 timestamp,string proposal,uint32 choice,string reason,string app,string metadata)"
        );

    // https://github.com/snapshot-labs/sx-monorepo/blob/fbb53dc9061babb740f3b83fcd9ec7e06ab71ac1/packages/sx.js/src/clients/offchain/ethereum-sig/types.ts#L21
    struct ArrayVote {
        string from;
        string space;
        uint64 timestamp;
        string proposal;
        uint32[] choice;
        string reason;
        string app;
        string metadata;
    }
    bytes32 private constant ARRAY_VOTE_TYPE_HASH =
        keccak256(
            "Vote(string from,string space,uint64 timestamp,string proposal,uint32[] choice,string reason,string app,string metadata)"
        );

    // https://github.com/snapshot-labs/sx-monorepo/blob/fbb53dc9061babb740f3b83fcd9ec7e06ab71ac1/packages/sx.js/src/clients/offchain/ethereum-sig/types.ts#L49
    struct WeightedVote {
        string from;
        string space;
        uint64 timestamp;
        string proposal;
        string choice;
        string reason;
        string app;
        string metadata;
    }
    bytes32 private constant WEIGHTED_VOTE_TYPE_HASH =
        keccak256(
            "Vote(string from,string space,uint64 timestamp,string proposal,string choice,string reason,string app,string metadata)"
        );
    
    // https://github.com/snapshot-labs/sx-monorepo/blob/fbb53dc9061babb740f3b83fcd9ec7e06ab71ac1/packages/sx.js/src/clients/offchain/ethereum-sig/types.ts#L36C14-L36C32
    struct EncryptedVote {
        string from;
        string space;
        uint64 timestamp;
        bytes32 proposal;
        string choice;
        string reason;
        string app;
        string metadata;
    }
    bytes32 private constant ENCRYPTED_VOTE_TYPE_HASH =
        keccak256(
            "Vote(string from,string space,uint64 timestamp,bytes32 proposal,string choice,string reason,string app,string metadata)"
        ); 

    constructor(address _signMessageLib) {
        if (_signMessageLib == address(0)) {
            revert InvalidAddress(_signMessageLib);
        }
        signMessageLib = _signMessageLib;
        deployedAt = address(this);
    }

    /**
     * @notice Marks a snapshot vote message as signed.
     * @param vote The snapshot single choice vote message.
     */
    function signSnapshotVote(BasicVote calldata vote, Domain calldata domain) external {
        _sign(
            abi.encode(
                BASIC_VOTE_TYPE_HASH,
                keccak256(bytes(vote.from)),
                keccak256(bytes(vote.space)),
                vote.timestamp,
                keccak256(bytes(vote.proposal)),
                vote.choice,
                keccak256(bytes(vote.reason)),
                keccak256(bytes(vote.app)),
                keccak256(bytes(vote.metadata))
            ),
            domain
        );
    }

    /**
     * @notice Marks a snapshot vote message as signed.
     * @param vote The snapshot multiple choice vote message.
     */
    function signSnapshotArrayVote(ArrayVote calldata vote, Domain calldata domain) external {
        _sign(
            abi.encode(
                ARRAY_VOTE_TYPE_HASH,
                keccak256(bytes(vote.from)),
                keccak256(bytes(vote.space)),
                vote.timestamp,
                keccak256(bytes(vote.proposal)),
                keccak256(abi.encodePacked(vote.choice)),
                keccak256(bytes(vote.reason)),
                keccak256(bytes(vote.app)),
                keccak256(bytes(vote.metadata))
            ),
            domain
        );
    }

    /**
     * @notice Marks a snapshot vote message as signed.
     * @param vote The snapshot weighted vote message.
     */
    function signSnapshotWeightedVote(WeightedVote calldata vote, Domain calldata domain) external {
        _sign(
            abi.encode(
                WEIGHTED_VOTE_TYPE_HASH,
                keccak256(bytes(vote.from)),
                keccak256(bytes(vote.space)),
                vote.timestamp,
                keccak256(bytes(vote.proposal)),
                keccak256(bytes(vote.choice)),
                keccak256(bytes(vote.reason)),
                keccak256(bytes(vote.app)),
                keccak256(bytes(vote.metadata))
            ),
            domain
        );
    }


    /**
     * @notice Marks a snapshot vote message as signed.
     * @param vote The snapshot encrypted vote message.
     */
    function signSnapshotEncryptedVote(EncryptedVote calldata vote, Domain calldata domain) external {
        _sign(
            abi.encode(
                ENCRYPTED_VOTE_TYPE_HASH,
                keccak256(bytes(vote.from)),
                keccak256(bytes(vote.space)),
                vote.timestamp,
                vote.proposal,
                keccak256(bytes(vote.choice)),
                keccak256(bytes(vote.reason)),
                keccak256(bytes(vote.app)),
                keccak256(bytes(vote.metadata))
            ),
            domain
        );
    }

    function _sign(bytes memory message, Domain calldata domain) internal {
        // First, make sure we're being delegatecalled
        if (address(this) == deployedAt) {
            revert InvalidCall();
        }

        // Then forward to the Safe SignMessageLib in another delegatecall
        (bool success, ) = signMessageLib.delegatecall(
            abi.encodeWithSignature(
                "signMessage(bytes)",
                abi.encodePacked(_toTypedDataHash(_buildDomainSeparator(domain), keccak256(message)))
            )
        );

        if (!success) {
            revert SignMessageLibCallFailed();
        }
    }

    function _buildDomainSeparator(Domain calldata domain) internal pure returns (bytes32) {
        return keccak256(abi.encode(DOMAIN_TYPE_HASH, keccak256(bytes(domain.name)), keccak256(bytes(domain.version))));
    }

    /**
     * taken from: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/MessageHashUtils.sol
     * Copyright (c) 2016-2023 zOS Global Limited and contributors
     * released under MIT license
     *
     * @dev Returns the keccak256 digest of an EIP-712 typed data (ERC-191 version `0x01`).
     *
     * The digest is calculated from a `domainSeparator` and a `structHash`, by prefixing them with
     * `\x19\x01` and hashing the result. It corresponds to the hash signed by the
     * https://eips.ethereum.org/EIPS/eip-712[`eth_signTypedData`] JSON-RPC method as part of EIP-712.
     *
     * See {ECDSA-recover}.
     */
    function _toTypedDataHash(bytes32 domainSeparator, bytes32 structHash) internal pure returns (bytes32 digest) {
        /// @solidity memory-safe-assembly
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, hex"19_01")
            mstore(add(ptr, 0x02), domainSeparator)
            mstore(add(ptr, 0x22), structHash)
            digest := keccak256(ptr, 0x42)
        }
    }
}
