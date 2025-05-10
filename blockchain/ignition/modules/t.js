import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NationalElectionModule = buildModule("NationalElectionModule", (m) => {
    const tokenAddress = "0x985F305e6ae6a98F73cD4bba57eF635ECca79053";
    const partiesAddress = "0x9A2C8Db4106bab8D12C3F3feCb8E5714eBaEEF58";

    // Deploy contract with constructor arguments
    const nationalElection = m.contract("NationalElection", [tokenAddress, partiesAddress]);

    return { nationalElection };
});

export default NationalElectionModule;
