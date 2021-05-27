pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
//import "@aave/protocol-v2/contracts/protocol/libraries/types/DataTypes.sol";

contract LynxUserFactory{

    event LynxUserCreated(address userAddress, address contractAddress);
    address public lendingPoolAddressesProvider;
    mapping(address => address) internal LynxUsers;
    address daiAddress = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;

    function addUser(address _keyUserAddress, address _valueUserContract) internal {
        LynxUsers[_keyUserAddress] = _valueUserContract;
    }

    function removeUser(address _keyUserAddress) internal {
        delete LynxUsers[_keyUserAddress];
    }
    
    function containsUser(address _keyUserAddress) internal view returns (bool) {
        return LynxUsers[_keyUserAddress] != address(0x0);
    }
    
    function getUserContractByKey(address _keyUserAddress) public view returns (address) {
        return LynxUsers[_keyUserAddress];
    }

    constructor(address _lendingPoolAddressesProvider) public {
        lendingPoolAddressesProvider = _lendingPoolAddressesProvider;
    }

    function getUserContract() internal view returns(bool, address){
        if (containsUser(msg.sender)) {
            return(true, getUserContractByKey(msg.sender));
        }
    }

    function getUserBalance() public view returns (uint256) {   
        address userContractAddress;
        bool existingUser;
        uint256 userBalance = 0;
        (existingUser, userContractAddress) = getUserContract();
        if (existingUser == true) {
            LynxUser userContract = LynxUser(userContractAddress);
            userBalance = userContract.getUserBalance();
        }
        return userBalance;
    }

    function doDeposit(uint256 _amount) public {
        address userContractAddress;
        bool existingUser;
        uint256 assetBalance = ERC20(daiAddress).balanceOf(msg.sender);
        require(assetBalance >= _amount, "Not enough tokens to deposit");

        (existingUser, userContractAddress) = getUserContract();
        if (existingUser == false) {
            userContractAddress = createLynxUserContract();
        }
        LynxUser userContract = LynxUser(userContractAddress);

        ERC20(daiAddress).transferFrom(msg.sender, address(this), _amount); //transfer to parent as it is approved on client site
        ERC20(daiAddress).transfer(userContractAddress, _amount); //transfer to user's contract
        //Option 2: //approve it here to be spent by child contract: require(ERC20(daiAddress).approve(userContractAddress, _amount), "Approve has failed for user contract");

        userContract.doDeposit(_amount);
    }

    function doWithdraw(uint256 _amount) public {
        address userContractAddress;
        bool existingUser;
        (existingUser, userContractAddress) = getUserContract();
        if (existingUser == true) {
            LynxUser userContract = LynxUser(userContractAddress);
            userContract.doWithdraw(_amount);
        }
        
    }

    function createLynxUserContract() internal returns (address) {
        LynxUser newUser = new LynxUser(msg.sender, lendingPoolAddressesProvider);
        address contractAddr = address(newUser);
        addUser(msg.sender, contractAddr);
        emit LynxUserCreated(msg.sender, contractAddr);
        return contractAddr;
    }
  
}

contract LynxUser is Ownable {
    //using SafeMath for uint256;

    event LogDeposit(
        address indexed _from,
        address indexed _to,
        address indexed _assetAddress,
        uint256 _depositAmount
    );

    event LogWithdraw(
        address indexed _from,
        address indexed _to,
        address indexed _assetAddress,
        uint256 _withdrawAmount
    );

    address public userAddress;
    address daiAddress = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;
    ILendingPoolAddressesProvider addressesProvider;
    ILendingPool lendingPool;

    constructor(address _userAddress, address _lendingPoolAddressesProvider) public {
        userAddress = _userAddress;
        addressesProvider = ILendingPoolAddressesProvider( _lendingPoolAddressesProvider);
        lendingPool = ILendingPool(addressesProvider.getLendingPool()); 
    }

    function doDeposit(uint256 _amount) public onlyOwner {
        require(_amount > 0, "Amount needs to be greater than 0!!!");

        //option 2 - see above
        //uint256 allowance = ERC20(daiAddress).allowance(msg.sender, address(this));
        //require(allowance >= _amount, "Please approve first");
        //ERC20(daiAddress).transferFrom(msg.sender, address(this), _amount);   //transfer user's DAI to this contract

        address lendingPoolAddress = addressesProvider.getLendingPool();
        require(ERC20(daiAddress).approve(lendingPoolAddress, _amount), "Approve has failed"); //approve first
        lendingPool.deposit(daiAddress, _amount, address(this), 0);

        require(ERC20(daiAddress).approve(userAddress, _amount), "Approve deposit has failed for user ???????");

        emit LogDeposit(userAddress, address(this), daiAddress, _amount);
    }

    function doWithdraw(uint256 _amount) public onlyOwner {
        lendingPool.withdraw(daiAddress, _amount, address(this));
        ERC20(daiAddress).transfer(userAddress, _amount); //send back to user
        emit LogWithdraw(address(this), userAddress, daiAddress, _amount);
    }

    function getUserBalance() external view returns (uint256) {
        address aDAI = lendingPool.getReserveData(daiAddress).aTokenAddress;        
        uint256 userBalance = ERC20(aDAI).balanceOf(address(this));
        return userBalance;
    }
    
}

