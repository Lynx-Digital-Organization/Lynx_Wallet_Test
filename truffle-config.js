const path = require("path");
require("dotenv").config({path : "./.env"});
const HDWalletProvider = require("@truffle/hdwallet-provider");
const AccountIndex = 0

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    ganache_local: {
      provider: function() {
          return new HDWalletProvider(process.env.MNEMONIC, "http://127.0.0.1:7545", AccountIndex )
      },
      network_id: 5777
      },
    kovan: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "https://kovan.infura.io/v3/f24c4b3e415047d98203b3533f08d72b", AccountIndex)
      },
      network_id: 42
    },
  },
  compilers: {
     solc: {
      version: "^0.6.12",
    },
  },

};
