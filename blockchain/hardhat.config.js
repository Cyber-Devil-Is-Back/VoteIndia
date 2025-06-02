require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  ignition: {
    requiredConfirmations: 1,
  },
  defaultNetwork: "hardhat",
  networks: {
    geth: {
      url: "http://127.0.0.1:8545",
      accounts: ["c38894ca22f4c929682864be5ad5d7f3855c4349a368e3ca66de34d8da575f76"],
      confirmations: 1  // ✅ This reduces block confirmations wait time
    },
  },
  solidity: "0.8.28",
};
