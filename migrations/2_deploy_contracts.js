const AaveAPY = artifacts.require("./AaveAPY.sol");

// 0x88757f2f99175387ab4c6a4b3067c77a695b0349 is the address for LendingPoolAddressesProvider
// on Kovan. (https://docs.aave.com/developers/deployed-contracts)
const LendingPoolAddressesProvider =
  "0x88757f2f99175387aB4C6a4b3067c77A695b0349";

module.exports = async function(deployer) {
  await deployer.deploy(AaveAPY, LendingPoolAddressesProvider);
};