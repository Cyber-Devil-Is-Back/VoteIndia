const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StateVote Contract", function () {
    let StateVote, stateVote, SwarajToken, swarajToken, Parties, parties, owner, addr1, addr2, addr3, addr4;

    beforeEach(async function () {
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

        SwarajToken = await ethers.getContractFactory("SwarajToken");
        swarajToken = await SwarajToken.deploy();
        await swarajToken.waitForDeployment();

        Parties = await ethers.getContractFactory("Parties");
        parties = await Parties.deploy();
        await parties.waitForDeployment();

        StateVote = await ethers.getContractFactory("StateVote");
        stateVote = await StateVote.deploy(swarajToken.getAddress(), parties.getAddress(), "Central");
        await stateVote.waitForDeployment();

        await parties.addParty(1, "Democratic Party", "DP");
        await parties.addParty(2, "Democratic Republic", "DR");
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await stateVote.owner()).to.equal(owner.address);
        });

        it("Should set the correct token and parties contract addresses", async function () {
            expect(await stateVote.swarajToken()).to.equal(await swarajToken.getAddress());
            expect(await stateVote.partiesContract()).to.equal(await parties.getAddress());
        });
    });

    describe("Candidate Management", function () {
        it("Should allow only the owner to add candidates", async function () {
            await expect(
                stateVote.connect(addr1).addCandidates("John Doe", 1, 1, "Maharashtra", "image-url")
            ).to.be.revertedWith("Not the owner");
        });

        it("Should allow owner to add a candidate", async function () {
            await expect(stateVote.addCandidates("John Doe", 1, 1, "Maharashtra", "image-url"))
                .to.emit(stateVote, "CandidateAdded")
                .withArgs("John Doe", 1, 0);
        });

        it("Should not allow adding a candidate with an empty name", async function () {
            await expect(stateVote.addCandidates("", 1, 1, "Maharashtra", "image-url"))
                .to.be.revertedWith("Candidate name is required");
        });

        it("Should fetch correct candidates by state", async function () {
            await stateVote.addCandidates("John Doe", 1, 1, "Maharashtra", "image-url");
            const candidates = await stateVote.getCandidatesByState("Maharashtra");
            expect(candidates.length).to.equal(1);
            expect(candidates[0].name).to.equal("John Doe");
        });
    });

    describe("Voting Mechanism", function () {
        beforeEach(async function () {
            await swarajToken.mint(owner.address, ethers.parseUnits("1000", 18));
            await swarajToken.connect(owner).depositGasFunds({ value: ethers.parseEther("0.005") });

            await swarajToken.batchTransfer([addr1.address, addr2.address]);
            await stateVote.addCandidates("John Doe", 1, 1, "Maharashtra", "image-url");
        });

        it("Should allow a voter to vote", async function () {
            await swarajToken.connect(addr1).approve(stateVote.target, ethers.parseUnits("1", 18));
            await expect(stateVote.connect(addr1).voteForCandidate(1))
                .to.emit(stateVote, "VoteCasted")
                .withArgs(addr1.address, 1, 1);
        });

        it("Should reject votes for non-existing candidates", async function () {
            await expect(stateVote.connect(addr1).voteForCandidate(999))
                .to.be.revertedWith("Candidate does not exist");
        });

        it("Should reject votes if voter has insufficient tokens", async function () {
            await expect(stateVote.connect(addr3).voteForCandidate(1))
                .to.be.revertedWith("Insufficient tokens");
        });
    });

    describe("Edge Cases", function () {

        beforeEach(async function () {
            await swarajToken.mint(owner.address, ethers.parseUnits("1000", 18));
            await swarajToken.connect(owner).depositGasFunds({ value: ethers.parseEther("0.005") });

            await swarajToken.batchTransfer([addr1.address, addr2.address]);
            await stateVote.addCandidates("John Doe", 1, 1, "Maharashtra", "image-url");
        });

        it("Should not allow adding a candidate with an invalid party ID", async function () {
            await expect(stateVote.addCandidates("Invalid", 2, 999, "State", "image-url"))
                .to.be.revertedWith("Party does not exist");
        });

        it("Should not allow voting with insufficient token allowance", async function () {
            await swarajToken.connect(addr1).approve(stateVote.target, ethers.parseUnits("0.5", 18));
            await expect(stateVote.connect(addr1).voteForCandidate(1))
                .to.be.revertedWith("Not enough allowance, approve more tokens");
        });

        it("Should correctly update the vote count after multiple votes", async function () {
            await swarajToken.connect(addr1).approve(stateVote.target, ethers.parseUnits("1", 18));
            await swarajToken.connect(addr2).approve(stateVote.target, ethers.parseUnits("1", 18));
            
            await stateVote.connect(addr1).voteForCandidate(1);
            await stateVote.connect(addr2).voteForCandidate(1);
            
            const candidate = await stateVote.candidate(1);
            expect(candidate.votecount).to.equal(2);
        });
    });

    describe("Security", function () {
        it("Should reject Ether transfers", async function () {
            await expect(
                owner.sendTransaction({ to: stateVote.target, value: ethers.parseEther("1") })
            ).to.be.revertedWith("No Ether Allowed");
        });
    });

    describe("Events", function () {
        it("Should emit CandidateAdded when a candidate is added", async function () {
            await expect(stateVote.addCandidates("Jane Doe", 2, 1, "Gujarat", "image-url"))
                .to.emit(stateVote, "CandidateAdded")
                .withArgs("Jane Doe",1, 0);
        });

        it("Should emit VoteCasted when a vote is cast", async function () {
            await swarajToken.mint(owner.address, ethers.parseUnits("1000", 18));
            await swarajToken.connect(owner).depositGasFunds({ value: ethers.parseEther("0.005") });

            await swarajToken.batchTransfer([addr1.address, addr2.address]);
            await stateVote.addCandidates("John Doe", 1, 1, "Maharashtra", "image-url");
            await swarajToken.connect(addr1).approve(stateVote.target, ethers.parseUnits("1", 18));
            await expect(stateVote.connect(addr1).voteForCandidate(1))
                .to.emit(stateVote, "VoteCasted")
                .withArgs(addr1.address, 1, 1);
        });
    });
});
