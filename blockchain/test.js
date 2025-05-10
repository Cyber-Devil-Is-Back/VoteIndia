const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8547");
    const code = await provider.getCode("0x778838e0d527268395f927698ad27316f6c33eab");

    console.log(code.length > 2 ? "Contract is deployed!" : "Contract not found.");
}

main();
