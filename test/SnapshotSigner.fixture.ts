import { ethers } from "hardhat";

import { SafeMock__factory, Safe__factory, SignMessageLib__factory, SnapshotSigner__factory } from "../../types";

export async function deploySnapshotSignerFixture() {
  // Contracts are deployed using the first signer/account by default
  const [deployer] = await ethers.getSigners();

  const SignMessageLib = await ethers.getContractFactory("SignMessageLib");
  const signMessageLib = await SignMessageLib.deploy();

  const SafeMock = await ethers.getContractFactory("SafeMock");
  const safe = await SafeMock.deploy();

  const SnapshotSigner = await ethers.getContractFactory("SnapshotSigner");
  const snapshotSigner = await SnapshotSigner.deploy(await signMessageLib.getAddress());

  return { snapshotSigner, safe, deployer };
}
