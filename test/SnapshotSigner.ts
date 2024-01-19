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
        from: "0x849d52316331967b6ff1198e5e32a0eb168d039d",
        space: "lido-snapshot.eth",
        timestamp: 1705506751,
        proposal: "0xc12ae07242326a719cb6b6a5eb19cb77eb4515b4a5ebe58508f965a5b9abb27c",
        choice: [1, 2],
        reason: "test",
        app: "snapshot",
        metadata: "{}",
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

      expect(data).to.equal("0x3da1747f8cf8c87e6d599bd083ea7aa62a616ed14c933b117c3b5c23ead3cb0b");
    });
  });

  describe("signSnapshotStringVote()", () => {
    it("correctly encodes the typed message", async () => {
      const { safe, snapshotSigner, signMessageLib } = await loadFixture(deploySnapshotSignerFixtureWithLibMock);

      const vote = {
        from: "0x849d52316331967b6ff1198e5e32a0eb168d039d",
        space: "lido-snapshot.eth",
        timestamp: 1705506751,
        proposal: "0xc12ae07242326a719cb6b6a5eb19cb77eb4515b4a5ebe58508f965a5b9abb27c",
        choice: "test choice",
        reason: "test",
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

      expect(data).to.equal("0xc20bf6a9aedc1e421710cd5a9fdbd3c7f878a0baf563a9b9859ad81277eaf2eb");
    });
  });
});
