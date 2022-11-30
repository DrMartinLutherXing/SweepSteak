// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Investor {

    address public owner;

    error NotOwner();
    modifier onlyOwner() {
        if (msg.sender != owner)
            revert NotOwner();
        _;
    }

    constructor() payable {
        owner = msg.sender;
    }

    function deliver() public /* only for testing! */
        onlyOwner
    {
        payable(owner).transfer(address(this).balance);
    }

}


