import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NationalElectionModule = buildModule("NationalElectionModule", (m) => {
  // Replace with actual deployed addresses or use other module deployment
  const swarajToken = m.getParameter("swarajTokenAddress");
  const partiesContract = m.getParameter("partiesContractAddress");

  const nationalElection = m.contract("NationalElection", [
    swarajToken,
    partiesContract,
  ]);

  return { nationalElection };
});

export default NationalElectionModule;
