const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VidhanSabhaElectionModule", (m) => {
  const tokenAddress = process.env.tokenaddress;
  const date = process.env.date;
  const state = process.env.state;
 

  const election = m.contract("VidhanSabhaElection", [tokenAddress, state,date]);

  return { election };
});
