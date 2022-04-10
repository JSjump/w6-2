// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();

  await treasury.deployed();

  const tokenAddress = treasury.address;

  const Gov = await ethers.getContractFactory("Gov");
  const gov = await Gov.deploy(tokenAddress);

  await gov.deployed();

  //   转移owner权限给gov
  await treasury.transferOwnership(gov.address);

  const transferCalldata = treasury.interface.encodeFunctionData("withdraw");

  // 提案， 管理员withdraw
  await gov.propose(
    [tokenAddress],
    [0],
    [transferCalldata],
    "Proposal #1: admin withdaw"
  );

  // 执行提案
  const descriptionHash = ethers.utils.id("Proposal #1: admin withdaw");
  await gov.execute([tokenAddress], [0], [transferCalldata], descriptionHash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
