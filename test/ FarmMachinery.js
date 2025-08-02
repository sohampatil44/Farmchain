const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FarmMachinery", function () {
    it("Should list machinery and rent/share it", async function () {
        const FarmMachinery = await ethers.getContractFactory("FarmMachinery");
        const farmMachinery = await FarmMachinery.deploy();
        await farmMachinery.deployed();

        await farmMachinery.listMachinery("Tractor", 10, 5);
        let machineries = await farmMachinery.getMachineries();
        expect(machineries.length).to.equal(1);

        const [owner, renter] = await ethers.getSigners();
        await farmMachinery.connect(renter).rentOrShareMachinery(0, true, { value: 10 });

        machineries = await farmMachinery.getMachineries();
        expect(machineries.length).to.equal(1);
    });
});