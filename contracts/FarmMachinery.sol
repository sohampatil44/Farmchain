// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FarmMachinery {
    struct Machinery {
        uint256 id;
        string name;
        uint256 rentPrice;
        uint256 sharePrice;
        address owner;
    }

    Machinery[] public machineries;
    uint256 public machineryCounter;

    function listMachinery(string memory _name, uint256 _rentPrice, uint256 _sharePrice) public {
        machineries.push(Machinery(machineryCounter, _name, _rentPrice, _sharePrice, msg.sender));
        machineryCounter++;
    }

    function rentOrShareMachinery(uint256 _machineryId, bool _rent) public payable {
        require(_machineryId < machineries.length, "Invalid machinery ID");
        Machinery storage machinery = machineries[_machineryId];
        if (_rent) {
            require(msg.value >= machinery.rentPrice, "Insufficient funds for rent");
        } else {
            require(msg.value >= machinery.sharePrice, "Insufficient funds for share");
        }
        payable(machinery.owner).transfer(msg.value);
    }

    function getMachineries() public view returns (Machinery[] memory) {
        return machineries;
    }
}