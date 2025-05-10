const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SwarajToken", function () {
    let Token, token, owner, addr1, addr2, addr3, addrs;

    beforeEach(async function () {
        Token = await ethers.getContractFactory("SwarajToken");
        [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
        token = await Token.deploy();
        await token.waitForDeployment();
    });

    it("Should have correct name and symbol", async function () {
        expect(await token.name()).to.equal("SwarajToken");
        expect(await token.symbol()).to.equal("SWJ");
    });

    it("Initial balance should be 0",async () => {
        expect(await token.totalSupply()).to.equal(0);
    });

    it("Owner should be able to mint tokens", async function () {
        await token.mint(owner.address, ethers.parseUnits("1000", 18));
        expect(await token.balanceOf(owner.address)).to.equal(ethers.parseUnits("1000", 18));
    });

    it("Should allow batch transfer of exactly 1 token to  recipients and send ETH for gas", async function () {
        await token.mint(owner.address, ethers.parseUnits("3", 18));
        
       await token.connect(owner).depositGasFunds({ value: ethers.parseEther("0.005") });

        await token.batchTransfer([addr1.address, addr2.address, addr3.address]);

        expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseUnits("1", 18));
        expect(await token.balanceOf(addr2.address)).to.equal(ethers.parseUnits("1", 18));
        expect(await token.balanceOf(addr3.address)).to.equal(ethers.parseUnits("1", 18));
    });

    it("Should fail if batch transfer has more recipients than tokens", async function () {
        await token.mint(owner.address, ethers.parseUnits("2", 18));

        await expect(
            token.batchTransfer([addr1.address, addr2.address, addr3.address])
        ).to.be.revertedWith("Not enough tokens");
    });

    it("Should allow batch burning of tokens", async function () {
        await token.mint(owner.address, ethers.parseUnits("3", 18));
        
       await token.connect(owner).depositGasFunds({ value: ethers.parseEther("0.005") });

        await token.batchTransfer([addr1.address, addr2.address]);
        await token.batchBurn([addr1.address, addr2.address]);

        expect(await token.balanceOf(addr1.address)).to.equal(0);
        expect(await token.balanceOf(addr2.address)).to.equal(0);
    });

    it("Should allow owner to burn all tokens", async function () {
        await token.mint(owner.address, ethers.parseUnits("10", 18));
        await token.burnAllTokens();

        expect(await token.totalSupply()).to.equal(0);
    });

    it("Should allow owner to deposit ETH for gas assistance", async function () {
        await token.connect(owner).depositGasFunds({ value: ethers.parseEther("1") });
        expect(await ethers.provider.getBalance(token.target)).to.equal(ethers.parseEther("1"));
    });

    it("Should allow owner to withdraw ETH from gas funds", async function () {
        await token.connect(owner).depositGasFunds({ value: ethers.parseEther("1") });

        const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
        await token.withdrawGasFunds(ethers.parseEther("1"));
        const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

        expect(finalOwnerBalance).to.be.greaterThan(initialOwnerBalance);
    });

    it("Should fail if non-owner tries to withdraw gas funds", async function () {
        await expect(token.connect(addr1).withdrawGasFunds(ethers.parseEther("1"))).to.be.reverted;
    });

    it("Should emit proper events for mint, burn, and transfers", async function () {
            // await expect(token.batchBurn([owner.address]))
            // .to.emit(token, "BatchBurn")
            // .withArgs(owner.address, ethers.parseUnits("1", 18));

        await expect(token.mint(owner.address, ethers.parseUnits("100", 18)))
            .to.emit(token, "Minted")
            .withArgs(owner.address, ethers.parseUnits("100", 18));

        await token.connect(owner).depositGasFunds({ value: ethers.parseEther("1") });

        await expect(token.batchTransfer([addr1.address]))
            .to.emit(token, "BatchTransfer")
            
        await expect(token.batchBurn([owner.address]))
            .to.emit(token, "BatchBurn")
            .withArgs(owner.address, ethers.parseUnits("1", 18));

        
    });

    it("Should correctly handle ETH gas transfer to recipients", async function () {
        await token.connect(owner).depositGasFunds({ value: ethers.parseEther("3") });
        await token.mint(owner.address, ethers.parseUnits("3", 18));

        const initialBalance = await ethers.provider.getBalance(addr1.address);

        await token.batchTransfer([addr1.address, addr2.address, addr3.address]);

        const finalBalance = await ethers.provider.getBalance(addr1.address);

        expect(finalBalance).to.be.greaterThan(initialBalance);
    });
});
