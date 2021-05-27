import React, { Component } from "react";
import LynxUserFactory from "./contracts/LynxUserFactory.json";
//import LynxUserFactory from "./contracts/LynxAave.json";
import Token from "./contracts/ERC20.json";
import getWeb3 from "./getWeb3";
import * as etherscan from './etherscan';

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
      this.LynxContractAddress = LynxUserFactory.networks[this.networkId] && LynxUserFactory.networks[this.networkId].address;
      console.log(this.LynxContractAddress);

      this.LynxUserFactoryinstance = new this.web3.eth.Contract(
        LynxUserFactory.abi,
        this.LynxContractAddress
      );
      
      this.Tokeninstance = new this.web3.eth.Contract(
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
  // *(this.web3.utils.toWei("1", "ether"))
  handleDepositSubmit = async () => {
    const { depositAmount } = this.state;
    const depositAmountInWei = this.web3.utils.toWei(depositAmount, "ether");
   
    await this.Tokeninstance.methods
      .approve(this.LynxContractAddress, depositAmountInWei)
      .send({ from: this.accounts[this.accountIndex] });

    const receipt = await this.LynxUserFactoryinstance.methods
      .doDeposit(depositAmountInWei)
      .send({ from: this.accounts[this.accountIndex] });

    //console.log(receipt.events.LynxUserCreated.raw);
    alert(depositAmount + " Dai deposited");
  };

  handleWithdrawSubmit = async () => {
    const { withdrawAmount } = this.state;
    const withdrawAmountInWei = this.web3.utils.toWei(withdrawAmount, "ether");

    await this.LynxUserFactoryinstance.methods
      .doWithdraw(withdrawAmountInWei)
      .send({ from: this.accounts[this.accountIndex] });
    
    alert(withdrawAmount + " Dai withdrawn");
  };

  handleBalanceSubmit = async () => {
    this.setState({
      balance: 0
    })
    var balanceX = await this.LynxUserFactoryinstance.methods
      .getUserBalance()
      .call({ from: this.accounts[this.accountIndex] });
      this.setState({
        balance: this.web3.utils.fromWei(balanceX, 'ether')
      })
  };

  handleContractAddressSubmit = async () => {
    //alert(this.accounts[this.accountIndex]);
    this.setState({
      contractAddress: 0x00
    })
    var addr = await this.LynxUserFactoryinstance.methods
      .getUserContractByKey(this.accounts[this.accountIndex])
      .call({ from: this.accounts[this.accountIndex] });

    this.setState({
      contractAddress: addr
    })
  };

  handleGetDataSubmit = async () => {
    this.setState({
      transactions: 'Transactions:'
    })
    var addr = await this.LynxUserFactoryinstance.methods
      .getUserContractByKey(this.accounts[this.accountIndex])
      .call({ from: this.accounts[this.accountIndex] });
    var jsonArr = await etherscan.getEtherscanData(addr);
    console.log(jsonArr);
    this.setState({
      transactions: JSON.stringify(jsonArr, null, 2)
    })
  };  

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Earn APY with Aave</h1>
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

        <h2>Your Contract Address</h2>
        Lynx Contract:{" "}
        <input
          type="text"
          name="contractAddress"
          style={{width: '350px'}}
          value={this.state.contractAddress}
          onChange={this.handleInputChange}
        />
        <button type="button" onClick={this.handleContractAddressSubmit}>
          Get Contract Address
        </button>

        <h2>Your Contract Data</h2>
        <pre>
          {this.state.transactions}
        </pre>
        <button type="button" onClick={this.handleGetDataSubmit}>
          Get Contract Data
        </button>

      </div>
    );
  }
}

export default App;
