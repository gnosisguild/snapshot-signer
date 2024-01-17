import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import snapshot from "@snapshot-labs/snapshot.js";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import { ethers } from "hardhat";

import { deploySnapshotSignerFixture } from "./SnapshotSigner.fixture";

const { Client712 } = snapshot;
const snapshotClient = new Client712();
snapshotClient.vote();

export const voteArrayTypes = {
  Vote: [
    { name: "from", type: "address" },
    { name: "space", type: "string" },
    { name: "timestamp", type: "uint64" },
    { name: "proposal", type: "string" },
    { name: "choice", type: "uint32[]" },
    { name: "reason", type: "string" },
    { name: "app", type: "string" },
    { name: "metadata", type: "string" },
  ],
};

export const voteArray2Types = {
  Vote: [
    { name: "from", type: "address" },
    { name: "space", type: "string" },
    { name: "timestamp", type: "uint64" },
    { name: "proposal", type: "bytes32" },
    { name: "choice", type: "uint32[]" },
    { name: "reason", type: "string" },
    { name: "app", type: "string" },
    { name: "metadata", type: "string" },
  ],
};

describe("SnapshotSigner", () => {
  describe("deployment", () => {
    it("reverts if zero address is passed", async () => {
      // We don't use the fixture here because we want a different deployment
      const SnapshotSigner = await ethers.getContractFactory("SnapshotSigner");
      await expect(SnapshotSigner.deploy(ZeroAddress)).to.be.revertedWithCustomError(SnapshotSigner, "InvalidAddress");
    });
  });

  describe("signSnapshotMessage()", () => {
    it("reverts if not called via delegatecall", async () => {
      const { safe, snapshotSigner, deployer } = await loadFixture(deploySnapshotSignerFixture);
      const tx = await snapshotSigner.signMessageLib.populateTransaction();
      await expect(safe.exec(tx.to, 0, tx.data, 0)).to.be.revertedWithCustomError(safe, "InvalidCall");

      deployer.signTypedData();
    });
  });
});
