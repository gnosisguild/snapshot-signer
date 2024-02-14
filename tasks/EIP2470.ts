import assert from "assert";
import { Contract, Signer, getCreate2Address, keccak256 } from "ethers";

const GAS_LIMIT_FACTOR: { [key: number]: number } = {
  42161: 25,
};

const EIP2470_FACTORY_ADDRESS = "0xce0042b868300000d44a59004da54a005ffdcf9f";

export async function deployViaFactory(
  initCode: string,
  deployer: Signer,
  gasLimit = 1_000_000,
  salt: string = "0x0000000000000000000000000000000000000000000000000000000000000000",
): Promise<string> {
  const provider = deployer.provider;
  assert(provider);

  if ((await provider.getCode(EIP2470_FACTORY_ADDRESS)) === "0x") {
    throw Error("EIP2470 SingletonFactory is not deployed on this chain");
  }

  const { chainId } = await provider.getNetwork();
  const gasLimitFactor = GAS_LIMIT_FACTOR[Number(chainId)] || 1;

  const factory = new Contract(
    EIP2470_FACTORY_ADDRESS,
    ["function deploy(bytes memory _initCode, bytes32 _salt) public returns (address payable createdContract)"],
    deployer,
  );

  const computedAddress = calculateDeployAddress(initCode, salt);

  if ((await provider.getCode(computedAddress)) != "0x") {
    console.log(`✔ Contract already deployed to: ${computedAddress}`);
    return computedAddress;
  }

  const receipt = await (
    await factory.deploy(initCode, salt, {
      gasLimit: gasLimit * gasLimitFactor,
    })
  ).wait();

  if (receipt?.status == 1) {
    console.log(`\x1B[32m✔ Contract deployed to: ${computedAddress} 🎉\x1B[0m `);
  } else {
    console.log(`\x1B[31m✘ Contract deployment failed.\x1B[0m`);
  }

  return computedAddress;
}

export const calculateDeployAddress = (initCode: string, salt: string) => {
  return getCreate2Address(EIP2470_FACTORY_ADDRESS, salt, keccak256(initCode));
};
