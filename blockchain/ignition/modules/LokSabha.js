// LokSabha.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("LokSabhaElectionModule", (m) => {
  const tokenAddress = process.env.tokenaddress
  const date = process.env.date
  console.log("Token Address:", tokenAddress);
  console.log("Date:", date);

  const election = m.contract("LokSabhaElection", [tokenAddress, date]);

  return { election };
});
