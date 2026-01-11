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

    event MachineryListed(uint256 id, string name, uint256 rentPrice, uint256 sharePrice, address owner);
    event MachineryRented(uint256 id, address renter, uint256 amount);
    event MachineryShared(uint256 id, address buyer, uint256 amount);

    function listMachinery(string memory _name, uint256 _rentPrice, uint256 _sharePrice) public {
        machineries.push(Machinery({
            id: machineryCounter,
            name: _name,
            rentPrice: _rentPrice,
            sharePrice: _sharePrice,
            owner: msg.sender
        }));
        
        emit MachineryListed(machineryCounter, _name, _rentPrice, _sharePrice, msg.sender);
        machineryCounter++;
    }

    function rentOrShareMachinery(uint256 _machineryId, bool _rent) public payable {
        require(_machineryId < machineries.length, "Invalid machinery ID");
        Machinery memory machinery = machineries[_machineryId];
        
        if (_rent) {
            require(msg.value >= machinery.rentPrice, "Insufficient payment for rent");
            emit MachineryRented(_machineryId, msg.sender, msg.value);
        } else {
            require(msg.value >= machinery.sharePrice, "Insufficient payment for share");
            emit MachineryShared(_machineryId, msg.sender, msg.value);
        }
        
        // Transfer payment to owner
        payable(machinery.owner).transfer(msg.value);
    }

    function getMachineries() public view returns (Machinery[] memory) {
        return machineries;
    }
}