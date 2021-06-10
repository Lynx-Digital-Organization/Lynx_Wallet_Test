pragma solidity ^0.6.0;

import "./LynxWallet.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract LynxFactory {
    event LynxWalletCreated(
        address _cloneAddress
    );

    mapping (address=>address) public lynxWallets;
    address immutable lynxWalletImplementationAddress;
    address lendingPoolAddressesProvider = 0x88757f2f99175387aB4C6a4b3067c77A695b0349; // Kovan address

    constructor(address _lynxWalletImplementationAddress) public{
        lynxWalletImplementationAddress = _lynxWalletImplementationAddress;
    }

    function createLynxWallet() external {
        require(lynxWallets[msg.sender] == address(0), "User has already created a lynx wallet");
        address cloneAddress = Clones.clone(lynxWalletImplementationAddress);
        LynxWallet(cloneAddress).initialize(lendingPoolAddressesProvider);

        emit LynxWalletCreated(cloneAddress);
        lynxWallets[msg.sender] = cloneAddress;
    }

    function getLynxWalletAddress() external view returns (address) {
        require(lynxWallets[msg.sender] != address(0), "User has not created a lynx wallet");
        return lynxWallets[msg.sender];
    }
}