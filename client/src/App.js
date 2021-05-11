import React, { Component } from "react";
import LynxAave from "./contracts/LynxAave.json";
import Token from "./contracts/ERC20.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, depositAmount: 0, withdrawAmount: 0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.getChainId();
      this.LynxContractAddress = LynxAave.networks[this.networkId] && LynxAave.networks[this.networkId].address;

      this.LynxAaveinstance = new this.web3.eth.Contract(
        LynxAave.abi,
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
      .send({ from: this.accounts[0] });

    await this.LynxAaveinstance.methods
      .doDeposit(depositAmountInWei)
      .send({ from: this.accounts[0] });

    alert(depositAmount + " Dai deposited");
  };

  handleWithdrawSubmit = async () => {
    const { withdrawAmount } = this.state;
    const withdrawAmountInWei = this.web3.utils.toWei(withdrawAmount, "ether");
    alert(withdrawAmountInWei);
    await this.LynxAaveinstance.methods
      .doWithdraw(withdrawAmountInWei)
      .send({ from: this.accounts[0] });
    alert(withdrawAmount + " Dai withdrawn");
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
      </div>
    );
  }
}

export default App;
