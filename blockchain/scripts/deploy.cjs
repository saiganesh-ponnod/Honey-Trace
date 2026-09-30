const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying HoneyTrace smart contract...");

  const HoneyTrace = await hre.ethers.getContractFactory("HoneyTrace");
  const honeyTrace = await HoneyTrace.deploy();

  await honeyTrace.waitForDeployment();

  const contractAddress = await honeyTrace.getAddress();
  console.log(`✅ HoneyTrace successfully deployed to: ${contractAddress}`);
  console.log(`⛓️ Transaction hash: ${honeyTrace.deploymentTransaction()?.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
