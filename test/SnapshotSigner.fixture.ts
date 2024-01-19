import { ethers } from "hardhat";

export async function deploySnapshotSignerFixture() {
  const SignMessageLib = await ethers.getContractFactory("SignMessageLib");
  const signMessageLib = await SignMessageLib.deploy();

  const SafeMock = await ethers.getContractFactory("SafeMock");
  const safe = await SafeMock.deploy();

  const SnapshotSigner = await ethers.getContractFactory("SnapshotSigner");
  const snapshotSigner = await SnapshotSigner.deploy(await signMessageLib.getAddress());

  return { snapshotSigner, safe, signMessageLib };
}

export async function deploySnapshotSignerFixtureWithLibMock() {
  const SignMessageLib = await ethers.getContractFactory("SignMessageLibMock");
  const signMessageLib = await SignMessageLib.deploy();

  const SafeMock = await ethers.getContractFactory("SafeMock");
  const safe = await SafeMock.deploy();

  const SnapshotSigner = await ethers.getContractFactory("SnapshotSigner");
  const snapshotSigner = await SnapshotSigner.deploy(await signMessageLib.getAddress());

  return { snapshotSigner, safe, signMessageLib };
}
