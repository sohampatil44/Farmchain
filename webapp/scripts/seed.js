const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const FarmMachinery = await hre.ethers.getContractFactory("FarmMachinery");
  const contract = FarmMachinery.attach(contractAddress);

  console.log("Adding machinery to blockchain...");

  const equipment = [
    { name: "John Deere Tractor", rent: "0.05", share: "0.15" },
    { name: "Case IH Harvester", rent: "0.12", share: "0.35" },
    { name: "Kubota Planter", rent: "0.03", share: "0.08" },
    { name: "Mahindra Cultivator", rent: "0.02", share: "0.06" },
    { name: "New Holland Baler", rent: "0.04", share: "0.12" },
    { name: "Tractor 6", rent: "0.05", share: "0.15" },
    { name: "Tractor 7", rent: "0.05", share: "0.15" },
  ];

  for (const item of equipment) {
    const tx = await contract.listMachinery(
      item.name,
      hre.ethers.utils.parseEther(item.rent),
      hre.ethers.utils.parseEther(item.share)
    );
    await tx.wait();
    console.log(`✅ Listed: ${item.name}`);
  }

  console.log("\n✅ Done! Blockchain now has 7 items (IDs 0-6)");
}

main().catch(console.error);