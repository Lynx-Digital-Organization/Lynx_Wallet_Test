pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/proxy/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";

contract LynxWallet is Initializable{
    using SafeMath for uint256;

    event LogDeposit(
        address indexed _from,
        address indexed _assetAddress,
        uint256 _depositAmount
    );

    event LogWithdraw(
        address indexed _to,
        address indexed _assetAddress,
        uint256 _withdrawAmount
    );
    // Kovan Dai address
    address daiAddress = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;

    ILendingPoolAddressesProvider addressesProvider;
    ILendingPool lendingPool;
    function initialize(
        address _lendingPoolAddressesProvider
    ) external initializer {
         addressesProvider = ILendingPoolAddressesProvider(_lendingPoolAddressesProvider);
         lendingPool = ILendingPool(addressesProvider.getLendingPool());
    }

    function doDeposit(uint256 _amount, address _userAddress) external {
        require(_amount > 0, "Amount needs to be greater than 0!!!");

        // uint256 allowance = ERC20(daiAddress).allowance(_userAddress, address(this));
        // require(allowance >= _amount, "Please approve first"); 

        //transfer user's DAI to contract
        ERC20(daiAddress).transferFrom(_userAddress, address(this), _amount); 
        
        address lendingPoolAddress = addressesProvider.getLendingPool();
        require(ERC20(daiAddress).approve(lendingPoolAddress, _amount), "Approve has failed");

        // Deposit into lending pool
        lendingPool.deposit(daiAddress, _amount, address(this), 0);

        emit LogDeposit(_userAddress, daiAddress, _amount);
    }

    function doWithdraw(uint256 _amount, address _userAddress) external {
        // Withdraw from lending pool
        lendingPool.withdraw(daiAddress, _amount, address(this));
        ERC20(daiAddress).transfer(_userAddress, _amount); //send back to user
        emit LogWithdraw(_userAddress, daiAddress, _amount);
    }

    function getUserBalance() external view returns (uint256) {
        address aDAI = lendingPool.getReserveData(daiAddress).aTokenAddress;        
        uint256 userBalance = ERC20(aDAI).balanceOf(address(this));
        return userBalance;
    }
}