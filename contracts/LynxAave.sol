pragma solidity ^0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";

//this option does not provide current user balance AND anyone can withdraw
contract LynxAave is Ownable {
    using SafeMath for uint256;

    event LogDeposit(
        address indexed _from,
        address indexed _assetAddress,
        uint256 _depositAmount,
        uint256 _anynumber,
        string _data
    );

    event LogWithdraw(
        address indexed _to,
        address indexed _assetAddress,
        uint256 _withdrawAmount
    );


    // DAI Address on Kovan
    address daiAddress = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;
    ILendingPoolAddressesProvider addressesProvider;
    //ERC20 dai = ERC20(0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa);

    constructor(address _lendingPoolAddressesProvider) public {
        addressesProvider = ILendingPoolAddressesProvider(
            _lendingPoolAddressesProvider
        );
    }

    //public onlyOwner

    function doDeposit(uint256 _amount) public {
        require(_amount > 0, "Amount needs to be greater than 0!!!");
        //bytes memory data = "";
        uint16 referralCode = 0;
        string memory data = "Start";

        uint256 assetBalance = ERC20(daiAddress).balanceOf(address(msg.sender));
        require(assetBalance >= _amount, "Not enough tokens to transfer");

        uint256 allowance = ERC20(daiAddress).allowance(msg.sender, address(this));
        require(allowance >= _amount, "Please approve first"); 

        //transfer user's DAI to this contract
        ERC20(daiAddress).transferFrom(msg.sender, address(this), _amount); 

        //*******start lending pool */
        ILendingPool lendingPool = ILendingPool(addressesProvider.getLendingPool());

        //approve first
        address lendingPoolAddress = addressesProvider.getLendingPool();
        uint256 allowanceLendingPool = ERC20(daiAddress).allowance(address(this), lendingPoolAddress); 
        //if (allowanceLendingPool < _amount) {
        require(ERC20(daiAddress).approve(lendingPoolAddress, _amount), "Approve has failed");
        //} 
        
        // Deposit into lending pool
        // ** Use "address(this)" to have DAI deposited under contract address
        lendingPool.deposit(daiAddress, _amount, address(this), referralCode);

        emit LogDeposit(msg.sender, daiAddress, _amount, allowanceLendingPool, data);
    }

    function doWithdraw(uint256 _amount) external {

        ILendingPool lendingPool = ILendingPool(addressesProvider.getLendingPool());
        // Withdraw from lending pool
        lendingPool.withdraw(daiAddress, _amount, address(this));
        ERC20(daiAddress).transfer(msg.sender, _amount); //send back to user

        emit LogWithdraw(msg.sender, daiAddress, _amount);
    }


}
