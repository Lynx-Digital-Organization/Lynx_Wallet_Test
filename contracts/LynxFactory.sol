pragma solidity ^0.6.6;

import "./LynxWallet.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract LynxFactory {
    event LynxWalletCreated(
        address _cloneAddress
    );

    LynxWallet[] public lynxWalletClones;
    address immutable lynxWalletImplementationAddress;

    constructor(address _lynxWalletImplementationAddress) public{
        lynxWalletImplementationAddress = _lynxWalletImplementationAddress;
    }

    function createLynxWalletClone(address _lendingPoolAddressesProvider) external {
        address cloneAddress = Clones.clone(lynxWalletImplementationAddress);
        LynxWallet(cloneAddress).initialize(_lendingPoolAddressesProvider);

        emit LynxWalletCreated(cloneAddress);
        lynxWalletClones.push(LynxWallet(cloneAddress));
    }

    function getLynxWalletClones() external view returns(LynxWallet[] memory) {
        return lynxWalletClones;
    }
    function getImplementationAddress() external view returns (address) {
        return lynxWalletImplementationAddress;
    }
}