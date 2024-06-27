import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import { ethers } from "hardhat";

import { SnapshotSigner__factory } from "../types";
import { deploySnapshotSignerFixture, deploySnapshotSignerFixtureWithLibMock } from "./SnapshotSigner.fixture";

describe("SnapshotSigner", () => {
  describe("deployment", () => {
    it("reverts if zero address is passed", async () => {
      // We don't use the fixture here because we want a different deployment
      const SnapshotSigner = await ethers.getContractFactory("SnapshotSigner");
      await expect(SnapshotSigner.deploy(ZeroAddress)).to.be.revertedWithCustomError(SnapshotSigner, "InvalidAddress");
    });
  });

  describe("general sign behavior", () => {
    const vote = {
      from: "0x849d52316331967b6ff1198e5e32a0eb168d039d",
      space: "lido-snapshot.eth",
      timestamp: 1705506751,
      proposal: "0xc12ae07242326a719cb6b6a5eb19cb77eb4515b4a5ebe58508f965a5b9abb27c",
      choice: 1,
      reason: "test",
      app: "snapshot",
      metadata: "{}",
    };

    const domain = {
      name: "snapshot",
      version: "0.1.4",
    };

    const signVoteTxData = SnapshotSigner__factory.createInterface().encodeFunctionData("signSnapshotVote", [
      vote,
      domain,
    ]);

    it("reverts if not called via delegatecall", async () => {
      const { safe, snapshotSigner } = await loadFixture(deploySnapshotSignerFixture);

      await expect(safe.exec(await snapshotSigner.getAddress(), 0, signVoteTxData, 0)).to.be.revertedWithCustomError(
        snapshotSigner,
        "InvalidCall",
      );
    });

    it("forwards to the SignMessageLib via delegatecall", async () => {
      const { safe, snapshotSigner, signMessageLib } = await loadFixture(deploySnapshotSignerFixtureWithLibMock);

      const res = await safe.exec(await snapshotSigner.getAddress(), 0, signVoteTxData, 1);
      const rec = await res.wait();
      const [_, thisAddress] = signMessageLib.interface.decodeEventLog("SignMessage", rec!.logs[0].data);
      expect(thisAddress).to.equal(await safe.getAddress());
    });

    it("marks the message as signed for the safe", async () => {
      const { safe, snapshotSigner, signMessageLib } = await loadFixture(deploySnapshotSignerFixture);
      console.log(await snapshotSigner.signMessageLib(), await signMessageLib.getAddress());
      await safe.exec(await snapshotSigner.getAddress(), 0, signVoteTxData, 1);

      // got the expected data from triggering a test vote with above data through the snapshot UI
      const expectedData = "0x464975e8555fb6c08d392a9f4348dfc47a84fff0373877a746f9283d6e170509";

      const [expectedHash] = await safe.execResult.staticCallResult(
        await signMessageLib.getAddress(),
        0,
        signMessageLib.interface.encodeFunctionData("getMessageHash", [expectedData]),
        1,
      );

      expect(await safe.getSignedMessage(expectedHash)).to.equal(1n);
    });
  });

  describe("signSnapshotVote()", () => {
    it("correctly encodes the typed message", async () => {
      const { safe, snapshotSigner, signMessageLib } = await loadFixture(deploySnapshotSignerFixtureWithLibMock);

      const vote = {
        from: "0x849d52316331967b6ff1198e5e32a0eb168d039d",
        space: "lido-snapshot.eth",
        timestamp: 1705506751,
        proposal: "0xc12ae07242326a719cb6b6a5eb19cb77eb4515b4a5ebe58508f965a5b9abb27c",
        choice: 1,
        reason: "test",
        app: "snapshot",
        metadata: "{}",
      };

      const domain = {
        name: "snapshot",
        version: "0.1.4",
      };

      const signVoteTxData = SnapshotSigner__factory.createInterface().encodeFunctionData("signSnapshotVote", [
        vote,
        domain,
      ]);

      const res = await safe.exec(await snapshotSigner.getAddress(), 0, signVoteTxData, 1);
      const rec = await res.wait();
      const [data] = signMessageLib.interface.decodeEventLog("SignMessage", rec!.logs[0].data);

      // got the expected data from triggering a test vote with above data through the snapshot UI
      expect(data).to.equal("0x464975e8555fb6c08d392a9f4348dfc47a84fff0373877a746f9283d6e170509");
    });
  });

  describe("signSnapshotArrayVote()", () => {
    it("correctly encodes the typed message", async () => {
      const { safe, snapshotSigner, signMessageLib } = await loadFixture(deploySnapshotSignerFixtureWithLibMock);

      const vote = {
        space: "1.snapspace.eth",
        proposal: "0xe4c12ed0735f021aabbe934f638d6d30aadf578efa2407c42329462cd58b262d",
        choice: [1, 2, 3, 4],
        app: "snapshot",
        reason: "",
        metadata: "{}",
        from: "0xfd0b893117d583bd63c31bb90a25842c739e8322",
        timestamp: 1719484134,
      };

      const domain = {
        name: "snapshot",
        version: "0.1.4",
      };

      const signVoteTxData = SnapshotSigner__factory.createInterface().encodeFunctionData("signSnapshotArrayVote", [
        vote,
        domain,
      ]);

      const res = await safe.exec(await snapshotSigner.getAddress(), 0, signVoteTxData, 1);
      const rec = await res.wait();
      const [data] = signMessageLib.interface.decodeEventLog("SignMessage", rec!.logs[0].data);

      // got the expected data from triggering a test vote with above data through the snapshot UI
      expect(data).to.equal("0xf6bd6d2f2801d3ce9caf1518c4598056cb3d9222e0cd740506e7c2527b2ef07c");
    });
  });

  describe("signSnapshotStringVote()", () => {
    it("correctly encodes the typed message", async () => {
      const { safe, snapshotSigner, signMessageLib } = await loadFixture(deploySnapshotSignerFixtureWithLibMock);

      const vote = {
        from: "0xfd0b893117d583bd63c31bb90a25842c739e8322",
        space: "1.snapspace.eth",
        timestamp: 1719486640,
        proposal: "0x27a4fe0aaad6665e37788b3e97d98165f287a8338d0676697aea46047465d026",
        choice: '{"1":4,"2":1}',
        reason: "",
        app: "snapshot",
        metadata: "{}",
      };

      const domain = {
        name: "snapshot",
        version: "0.1.4",
      };

      const signVoteTxData = SnapshotSigner__factory.createInterface().encodeFunctionData("signSnapshotStringVote", [
        vote,
        domain,
      ]);

      const res = await safe.exec(await snapshotSigner.getAddress(), 0, signVoteTxData, 1);
      const rec = await res.wait();
      const [data] = signMessageLib.interface.decodeEventLog("SignMessage", rec!.logs[0].data);

      // got the expected data from triggering a test vote with above data through the snapshot UI
      expect(data).to.equal("0x07960f31f18373e98efa672d04cbd93ea02932249745b7d3bfa0e02070000653");
    });
  });
});
