require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    geth: {
      url: "http://127.0.0.1:8545",
      accounts: ["c38894ca22f4c929682864be5ad5d7f3855c4349a368e3ca66de34d8da575f76"]  // Replace with your actual private key
    },
  },
  solidity: "0.8.28",
}



// eth.sendTransaction({
//   from: "0xd1e05c2a3b759f1cb1d825b4993349a39526d920",
//   to: " 0xde67ef2e20d0700bac6a073c8d7e6892db12bcbb",
//   value: web3.toWei(10, "ether")
// })
