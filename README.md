# SnapshotSigner [![Open in Gitpod][gitpod-badge]][gitpod] [![Github Actions][gha-badge]][gha] [![Hardhat][hardhat-badge]][hardhat] [![License: MIT][license-badge]][license]

[gitpod]: https://gitpod.io/#https://github.com/gnosisguild/snapshot-signer
[gitpod-badge]: https://img.shields.io/badge/Gitpod-Open%20in%20Gitpod-FFB45B?logo=gitpod
[gha]: https://github.com/gnosisguild/snapshot-signer/actions
[gha-badge]: https://github.com/gnosisguild/snapshot-signer/actions/workflows/ci.yml/badge.svg
[hardhat]: https://hardhat.org/
[hardhat-badge]: https://img.shields.io/badge/Built%20with-Hardhat-FFDB1C.svg
[license]: https://opensource.org/licenses/MIT
[license-badge]: https://img.shields.io/badge/License-MIT-blue.svg

An adapter contract to plug in front of the Safe SignMessageLib, producing EIP-712 signatures for Snapshot votes

## Audits

An audit has been performed by [Côme du Crest](https://cducrest.github.io/auditor-blog/) for Gnosis. No issues have been
identified in the audit.

The audit report is available at https://gnosischain.notion.site/Snapshot-Signer-f890f1f3dba74f11bdd1702d17d9e05c.

## Security and Liability

All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
PURPOSE.

## Deployments

Address: `0xD88504B3e646454D6d458dd610B6c351d7bcAA0f`

- [Sepolia](https://sepolia.etherscan.io/address/0xD88504B3e646454D6d458dd610B6c351d7bcAA0f#code)
- [Arbitrum](https://arbiscan.io/address/0xD88504B3e646454D6d458dd610B6c351d7bcAA0f#code)

(forwarding to `SignMessageLib` at `0xd53cd0aB83D845Ac265BE939c57F53AD838012c9`)

## Usage

### Pre Requisites

First, you need to install the dependencies:

```sh
$ bun install
```

Then, you need to set up all the required env variable. Create a `.env` file based on `.env.example`.

### Compile

Compile the smart contracts with Hardhat:

```sh
$ bun run compile
```

### TypeChain

Compile the smart contracts and generate TypeChain bindings:

```sh
$ bun run typechain
```

### Test

Run the tests with Hardhat:

```sh
$ bun run test
```

### Lint Solidity

Lint the Solidity code:

```sh
$ bun run lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ bun run lint:ts
```

### Coverage

Generate the code coverage report:

```sh
$ bun run coverage
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true bun run test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ bun run clean
```

### Deploy

Deploy the contract:

```sh
$ bun run deploy <network>
```

Currently the following values for `<network>` are supported:

- `hardhat`
- `mainnet`
- `sepolia`
- `gnosis`
- `arbitrum`

## License

This project is licensed under MIT.
