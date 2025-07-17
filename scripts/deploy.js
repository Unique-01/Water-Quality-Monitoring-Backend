const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const WaterQuality = await hre.ethers.getContractFactory("WaterQuality");
  const waterQuality = await WaterQuality.deploy();
  await waterQuality.waitForDeployment();
  const contractAddress = await waterQuality.getAddress();
  console.log("WaterQuality deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});