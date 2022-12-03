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
//        owner.transfer(address(this).balance);
//        owner.send(address(this).balance);
//        owner.call.value(address(this).balance)();

        (bool sent, bytes memory data) = owner.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");

    }

}


