// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract priced {

    error invalidSubmissionPrice();

    modifier costs(uint price) {
        if (msg.value != price)
            revert invalidSubmissionPrice();
        _;
    }

}


