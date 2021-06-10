const chai = require("chai");
chai.use(require("chai-as-promised"));
const BN = web3.utils.BN;

const LynxFactory = artifacts.require("LynxFactory");
const LynxWallet = artifacts.require("LynxWallet");
const Token = artifacts.require("ERC20");

contract("LynxFactory", async accounts => {
    const userAccountAddress = accounts[0]; // "0x16463c0fdB6BA9618909F5b120ea1581618C1b9E"; //unlocked big Dai holder account in ganache mainnet fork
    const daiAddress = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD"; //kovan address //"0x6b175474e89094c44da98b954eedeac495271d0f"; //mainnet address
    const depositAmount = new BN(10);
    const withdrawAmount = new BN(5);
    let userWalletAddress;
    let userWallet;
    let lynxFactoryInstance;
    let daiToken;

    before(async () => {
        lynxFactoryInstance = await LynxFactory.deployed();
        await lynxFactoryInstance.createLynxWallet({ from: userAccountAddress});
        userWalletAddress = await lynxFactoryInstance.getLynxWalletAddress({ from: userAccountAddress});
        userWallet = await LynxWallet.at(userWalletAddress);
        daiToken = await Token.at(daiAddress);
    })

    it("Should deposit 10 Dai with user's wallet", async () => {
        await daiToken.approve(userWalletAddress, depositAmount, { from: userAccountAddress});
        const res = await debug(userWallet.doDeposit(depositAmount, userAccountAddress));
        const { logs } = res;
        assert.equal(logs[0].event, "LogDeposit")
    })

    it("Should return user's wallet's balance", async () => {
        const balance = await userWallet.getUserBalance();
        assert.equal(balance.toNumber(), 10);
    })

    it("Should withdraw 5 Dai with user's wallet", async () => {
        const res = await userWallet.doWithdraw(withdrawAmount, userAccountAddress);
        const { logs } = res;
        assert.equal(logs[0].event, "LogWithdraw")
    })
});