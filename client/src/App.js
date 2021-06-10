import React, { Component } from "react";
import LynxFactory from "./contracts/LynxFactory.json";
import LynxWallet from "./contracts/LynxWallet.json";
import Token from "./contracts/ERC20.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, depositAmount: 0, withdrawAmount: 0 };

  componentDidMount = async () => {
    try {
      this.accountIndex = 0;
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.getChainId();
      this.LynxContractAddress = LynxFactory.networks[this.networkId] && LynxFactory.networks[this.networkId].address;

      this.LynxFactoryInstance = new this.web3.eth.Contract(
        LynxFactory.abi,
        this.LynxContractAddress
      );
      
      this.TokenInstance = new this.web3.eth.Contract(
         Token.abi,
         "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD"
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ loaded: true });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  };

  handleCreateWalletSubmit = async () => {
    await this.LynxFactoryInstance.methods
      .createLynxWallet()
      .send({ from: this.accounts[this.accountIndex] });
  };

  handleDepositSubmit = async () => {
    const { depositAmount } = this.state;
    const depositAmountInWei = this.web3.utils.toWei(depositAmount, "ether");
    const userWalletAddress = await this.LynxFactoryInstance.methods
      .getLynxWalletAddress()
      .call({ from: this.accounts[this.accountIndex] });

    alert("Depositing with Lynx Wallet at address: " + userWalletAddress);

    const userLynxWalletInstance = new this.web3.eth.Contract(
      LynxWallet.abi,
      userWalletAddress
    );
  
    await this.TokenInstance.methods
      .approve(userWalletAddress, depositAmountInWei)
      .send({ from: this.accounts[this.accountIndex] });

    await userLynxWalletInstance.methods
      .doDeposit(depositAmountInWei, this.accounts[this.accountIndex])
      .send({ from: this.accounts[this.accountIndex] });

    alert(depositAmount + " Dai deposited");
  };

  handleWithdrawSubmit = async () => {
    const { withdrawAmount } = this.state;
    const withdrawAmountInWei = this.web3.utils.toWei(withdrawAmount, "ether");
    const userWalletAddress = await this.LynxFactoryInstance.methods
      .getLynxWalletAddress()
      .call({ from: this.accounts[this.accountIndex] });

    alert("Withdrawing from Lynx Wallet at address: " + userWalletAddress);

    const userLynxWalletInstance = new this.web3.eth.Contract(
      LynxWallet.abi,
      userWalletAddress
    );

    await userLynxWalletInstance.methods
      .doWithdraw(withdrawAmountInWei,this.accounts[this.accountIndex])
      .send({ from: this.accounts[this.accountIndex] });
    
    alert(withdrawAmount + " Dai withdrawn");
  };

  handleBalanceSubmit = async () => {
    const userWalletAddress = await this.LynxFactoryInstance.methods
      .getLynxWalletAddress()
      .call({ from: this.accounts[this.accountIndex] });

    const userLynxWalletInstance = new this.web3.eth.Contract(
      LynxWallet.abi,
      userWalletAddress
    );

    this.setState({
      balance: 0
    })
    var balanceX = await userLynxWalletInstance.methods
      .getUserBalance()
      .call({ from: this.accounts[this.accountIndex] });
      this.setState({
        balance: this.web3.utils.fromWei(balanceX, 'ether')
      })
  };

  // handleUserWalletAddressSumbit = async () => {
  //   this.setState({
  //     walletAddress: 0
  //   })
  //   var userWalletAddress = await this.LynxFactoryInstance.methods
  //     .getLynxWalletAddress()
  //     .call({ from: this.accounts[this.accountIndex] });
  //     this.setState({
  //       walletAddress: userWalletAddress
  //     })
  // };
 
  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Earn APY with Aave</h1>

        <h2>Register for Lynx Wallet</h2>
        <button type="button" onClick={this.handleCreateWalletSubmit}>
          Create my wallet
        </button>

        <h2>Enter amount in Dai to deposit</h2>
        Dai Amount:{" "}
        <input
          type="text"
          name="depositAmount"
          value={this.state.depositAmount}
          onChange={this.handleInputChange}
        />
        <button type="button" onClick={this.handleDepositSubmit}>
          Deposit
        </button>

        <h2>Enter amount in Dai to withdraw</h2>
        Dai Amount:{" "}
        <input
          type="text"
          name="withdrawAmount"
          value={this.state.withdrawAmount}
          onChange={this.handleInputChange}
        />
        <button type="button" onClick={this.handleWithdrawSubmit}>
          Withdraw
        </button>

        <h2>Your Balance</h2>
        Dai Balance:{" "}
        <input
          type="text"
          name="balance"
          value={this.state.balance}
          onChange={this.handleInputChange}
        />
        <button type="button" onClick={this.handleBalanceSubmit}>
          Get Balance
        </button>

        {/* <h2>Your Wallet Address</h2>
        User Wallet Address:{" "}
        <input
          type="text"
          name="address"
          value={this.state.walletAddress}
          onChange={this.handleInputChange}
        />
        <button type="button" onClick={this.handleUserWalletAddressSumbit()}>
          Get Address
        </button> */}

      </div>
    );
  }
}

export default App;
