pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";

contract AaveAPY {
    ILendingPoolAddressesProvider addressesProvider;
    ILendingPool lendingPool;

    // DAI Address on Kovan
    ERC20 dai = ERC20(0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa);
    // Referral program for AAVE (https://docs.aave.com/developers/referral-program)
    uint16 referralCode = 0;

    // Constructor takes the address of the AAVE protocol addresses provider. Should not change once deployed.
    // (https://docs.aave.com/developers/deployed-contracts)
    constructor(address _lendingPoolAddressesProvider) public {
        addressesProvider = ILendingPoolAddressesProvider(
            _lendingPoolAddressesProvider
        );
        lendingPool = ILendingPool(addressesProvider.getLendingPool());
    }

    // Signals to the front end whether or not the deposit was successful
    event DepositSuccesful(bool success);

    function deposit(uint256 amount) external {
        require(amount > 0, "Amount needs to be greater than 0");

        // Transfer DAI to this contract
        dai.transferFrom(msg.sender, address(this), amount);

        // Approve contract to deposit it into the lendingPool
        dai.increaseAllowance(address(lendingPool), amount);

        // Deposit into lending pool
        lendingPool.deposit(address(dai), amount, msg.sender, referralCode);

        emit DepositSuccesful(true);
    }

    // Signals to the front end whether or not the withdraw was successful
    event WithdrawSuccesful(bool success);

    function withdraw(uint256 amount) external {
        // Withdraw from lending pool
        lendingPool.withdraw(address(dai), amount, msg.sender);

        emit WithdrawSuccesful(true);
    }
}