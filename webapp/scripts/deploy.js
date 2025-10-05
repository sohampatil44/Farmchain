const hre = require("hardhat");

async function main() {
    const FarmMachinery = await hre.ethers.getContractFactory("FarmMachinery");
    const farmMachinery = await FarmMachinery.deploy();
    await farmMachinery.deployed();
    console.log("FarmMachinery deployed to:", farmMachinery.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});