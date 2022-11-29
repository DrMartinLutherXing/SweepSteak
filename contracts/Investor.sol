// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Investor {

    address public payable owner;

    error NotOwner();
    modifier onlyOwner() {
        if (msg.sender != owner)
            revert OnlyOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function withdraw()
        onlyOwner
    {
        owner.transfer(address(this).balance);
    }

}


