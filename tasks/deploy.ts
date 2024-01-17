import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

const DEFAULT_SIGN_MESSAGE_LIB = "0xd53cd0aB83D845Ac265BE939c57F53AD838012c9";

task("task:deploy", "Deploys SnapshotSigner Contract")
  .addParam(
    "signMessageLib",
    "Address of the Safe SignMessageLib contract to forward calls to",
    DEFAULT_SIGN_MESSAGE_LIB,
  )
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers = await ethers.getSigners();
    const signMessageLib = taskArguments.signMessageLib as `0x${string}`;

    const snapshotSignerFactory = await ethers.getContractFactory("SnapshotSigner");
    console.log(`Deploying SnapshotSigner forwarding to SignMessageLib at ${signMessageLib}`);
    const snapshotSigner = await snapshotSignerFactory.connect(signers[0]).deploy(signMessageLib);
    await snapshotSigner.waitForDeployment();
    console.log("SnapshotSigner deployed to: ", await snapshotSigner.getAddress());
  });
