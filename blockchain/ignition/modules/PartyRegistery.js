import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PartyRegisteryModule", (m) => {
  const parties = m.contract("PartyRegistry", []);

  return { parties };
});
