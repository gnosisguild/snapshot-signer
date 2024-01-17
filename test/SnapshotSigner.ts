import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import { ethers } from "hardhat";

import { deploySnapshotSignerFixture } from "./SnapshotSigner.fixture";

describe("SnapshotSigner", function () {
  describe("deployment", function () {
    it("reverts if zero address is passed", async function () {
      // We don't use the fixture here because we want a different deployment
      const SnapshotSigner = await ethers.getContractFactory("SnapshotSigner");
      await expect(SnapshotSigner.deploy(ZeroAddress)).to.be.revertedWithCustomError(SnapshotSigner, "InvalidAddress");
    });
  });

  describe("signSnapshotMessage()", () => {
    it("reverts if not called via delegatecall", async function () {
      const { safe, snapshotSigner } = await loadFixture(deploySnapshotSignerFixture);
      const tx = await snapshotSigner.signMessageLib.populateTransaction();
      await expect(safe.exec(tx.to, 0, tx.data, 0)).to.be.revertedWithCustomError(safe, "InvalidCall");
    });
  });
});
