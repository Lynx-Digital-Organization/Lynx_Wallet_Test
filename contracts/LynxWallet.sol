pragma solidity ^0.6.6;

import "@openzeppelin/contracts/proxy/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";

contract LynxWallet is Initializable{
     using SafeMath for uint256;

    event LogDeposit(
        address indexed _from,
        address indexed _assetAddress,
        uint256 _depositAmount,
        uint256 _anynumber
    );

    event LogWithdraw(
        address indexed _to,
        address indexed _assetAddress,
        uint256 _withdrawAmount
    );
    // Kovan Dai address
    address daiAddress = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;

    ILendingPoolAddressesProvider addressesProvider;
    function initialize(
        address _lendingPoolAddressesProvider
    ) external initializer {
         addressesProvider = ILendingPoolAddressesProvider(_lendingPoolAddressesProvider);
    }

    function doDeposit(uint256 _amount) external {
        require(_amount > 0, "Amount needs to be greater than 0!!!");
        uint16 referralCode = 0;

        uint256 allowance = ERC20(daiAddress).allowance(msg.sender, address(this));
        require(allowance >= _amount, "Please approve first"); 

        //transfer user's DAI to contract
        ERC20(daiAddress).transferFrom(msg.sender, address(this), _amount); 

        ILendingPool lendingPool = ILendingPool(addressesProvider.getLendingPool());

        //approve first
        address lendingPoolAddress = addressesProvider.getLendingPool();
        uint256 allowanceLendingPool = ERC20(daiAddress).allowance(address(this), lendingPoolAddress); 

        require(ERC20(daiAddress).approve(lendingPoolAddress, _amount), "Approve has failed");

        // Deposit into lending pool
        lendingPool.deposit(daiAddress, _amount, address(this), referralCode);

        emit LogDeposit(msg.sender, daiAddress, _amount, allowanceLendingPool);
    }

    function doWithdraw(uint256 _amount) external {

        ILendingPool lendingPool = ILendingPool(addressesProvider.getLendingPool());
 
        // Withdraw from lending pool
        lendingPool.withdraw(daiAddress, _amount, address(this));

        emit LogWithdraw(msg.sender, daiAddress, _amount);
    }
}