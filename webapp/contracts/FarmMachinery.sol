// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FarmMachinery {
    event Rented(uint256 listingId, address farmer, uint256 numDays, uint256 amount);

    function rent(uint256 listingId, uint256 numDays) external payable {
        require(numDays > 0, "Days must be greater than 0");
        require(msg.value > 0, "Payment required");
        emit Rented(listingId, msg.sender, numDays, msg.value);
    }
}