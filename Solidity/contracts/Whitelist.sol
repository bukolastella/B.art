//SPDX-License-Identifier:Unlicense
pragma solidity ^0.8.0;


contract Whitelist {
    
    uint8 public maxNumber = 20;
    uint8 public NoOfAddresses;

    mapping (address => bool) public WhiteListedAddresses;

    function addToWhitelist () public {
      require(NoOfAddresses < maxNumber, 'Max Number of Whitelisted Address Reached');
      require(!WhiteListedAddresses[msg.sender], 'You are already Whitelisted');
      WhiteListedAddresses[msg.sender] = true;
      NoOfAddresses += 1;
    }



}