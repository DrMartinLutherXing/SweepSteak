// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Investor {

    address payable public owner;

    error NotOwner();
    modifier onlyOwner() {
        if (msg.sender != owner)
            revert NotOwner();
        _;
    }

    constructor() payable {
        owner = payable(msg.sender);
    }

    function deliver() public /* only for testing! */
//        onlyOwner
    {
        owner.transfer(address(this).balance);
    }

}


