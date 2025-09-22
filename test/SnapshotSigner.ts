import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import { ethers } from "hardhat";
import { hashTypedData } from "viem";

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
      timestamp: 1705506751n,
      proposal: "0xc12ae07242326a719cb6b6a5eb19cb77eb4515b4a5ebe58508f965a5b9abb27c",
      choice: 1,
      reason: "test",
      app: "snapshot",
      metadata: "{}",
    } as const;

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
      await safe.exec(await snapshotSigner.getAddress(), 0, signVoteTxData, 1);

      const expectedData = hashTypedData({
        domain,
        types: {
          Vote: [
            { name: "from", type: "string" },
            { name: "space", type: "string" },
            { name: "timestamp", type: "uint64" },
            { name: "proposal", type: "string" },
            { name: "choice", type: "uint32" },
            { name: "reason", type: "string" },
            { name: "app", type: "string" },
            { name: "metadata", type: "string" },
          ],
        },
        primaryType: "Vote",
        message: vote,
      });

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
        timestamp: 1705506751n,
        proposal: "0xc12ae07242326a719cb6b6a5eb19cb77eb4515b4a5ebe58508f965a5b9abb27c",
        choice: 1,
        reason: "test",
        app: "snapshot",
        metadata: "{}",
      } as const;

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

      const expectedData = hashTypedData({
        domain,
        types: {
          Vote: [
            { name: "from", type: "string" },
            { name: "space", type: "string" },
            { name: "timestamp", type: "uint64" },
            { name: "proposal", type: "string" },
            { name: "choice", type: "uint32" },
            { name: "reason", type: "string" },
            { name: "app", type: "string" },
            { name: "metadata", type: "string" },
          ],
        },
        primaryType: "Vote",
        message: vote,
      });

      expect(data).to.equal(expectedData);
    });
  });

  describe("signSnapshotArrayVote()", () => {
    it("correctly encodes the typed message", async () => {
      const { safe, snapshotSigner, signMessageLib } = await loadFixture(deploySnapshotSignerFixtureWithLibMock);

      const vote = {
        app: "snapshot-v2",
        from: "0x0eB5B03c0303f2F47cD81d7BE4275AF8Ed347576",
        space: "arbitrumfoundation.eth",
        choice: [1, 2, 3, 4, 5, 6],
        reason: "",
        metadata: "",
        proposal: "0xb41324ddcc115d08149b192e0b8ae4cfad0ef39cecb5663ea63d8a460d2cb3cc",
        timestamp: 1757486936n,
      } as const;

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

      const expectedData = hashTypedData({
        domain,
        types: {
          Vote: [
            {
              name: "from",
              type: "string",
            },
            {
              name: "space",
              type: "string",
            },
            {
              name: "timestamp",
              type: "uint64",
            },
            {
              name: "proposal",
              type: "string",
            },
            {
              name: "choice",
              type: "uint32[]",
            },
            {
              name: "reason",
              type: "string",
            },
            {
              name: "app",
              type: "string",
            },
            {
              name: "metadata",
              type: "string",
            },
          ],
        },
        primaryType: "Vote",
        message: vote,
      });

      expect(data).to.equal(expectedData);
    });
  });

  describe("signSnapshotStringVote()", () => {
    it("correctly encodes the typed message", async () => {
      const { safe, snapshotSigner, signMessageLib } = await loadFixture(deploySnapshotSignerFixtureWithLibMock);

      const vote = {
        from: "0xfd0b893117d583bd63c31bb90a25842c739e8322",
        space: "1.snapspace.eth",
        timestamp: 1719486640n,
        proposal: "0x27a4fe0aaad6665e37788b3e97d98165f287a8338d0676697aea46047465d026",
        choice: '{"1":4,"2":1}',
        reason: "",
        app: "snapshot",
        metadata: "{}",
      } as const;

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

      const expectedData = hashTypedData({
        domain,
        types: {
          Vote: [
            { name: "from", type: "string" },
            { name: "space", type: "string" },
            { name: "timestamp", type: "uint64" },
            { name: "proposal", type: "string" },
            { name: "choice", type: "string" },
            { name: "reason", type: "string" },
            { name: "app", type: "string" },
            { name: "metadata", type: "string" },
          ],
        },
        primaryType: "Vote",
        message: vote,
      });

      expect(data).to.equal(expectedData);
    });
  });
});
