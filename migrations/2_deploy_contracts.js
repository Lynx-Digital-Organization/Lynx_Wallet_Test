let LynxWallet = artifacts.require("LynxWallet")
let LynxFactory = artifacts.require("LynxFactory")

module.exports = async function (deployer, network) {
    try {

        let lendingPoolAddressesProviderAddress;

        switch(network) {
            case "mainnet":
            case "ganache_mainnet":
            case "development": // For Ganache mainnet forks
                lendingPoolAddressesProviderAddress = "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8"; break
            case "ropsten":
            case "ropsten-fork":
                lendingPoolAddressesProviderAddress = "0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728"; break
            case "kovan":
            case "kovan-fork":
                lendingPoolAddressesProviderAddress = "0x88757f2f99175387ab4c6a4b3067c77a695b0349"; break
            default:
                throw Error(`Are you deploying to the correct network? (network selected: ${network})`)
        }

        await deployer.deploy(LynxWallet).then(() => deployer.deploy(LynxFactory, LynxWallet.address));
    } catch (e) {
        console.log(`Error in migration: ${e.message}`)
    }
}