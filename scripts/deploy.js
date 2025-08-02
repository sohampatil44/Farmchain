async function main() {
    const FarmMachinery = await ethers.getContractFactory("FarmMachinery");
    const farmMachinery = await FarmMachinery.deploy();

    await farmMachinery.deployed();

    console.log("FarmMachinery deployed to:", farmMachinery.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });