import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SwarajTokenModule = buildModule("SwarajTokenModule", (m) => {
  const swarajToken = m.contract("SwarajToken");

  return { swarajToken };
});

export default SwarajTokenModule;

