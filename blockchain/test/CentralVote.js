const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CentralVote Contract", function () {
    let CentralVote, centralVote, SwarajToken, swarajToken, Parties, parties, owner, addr1, addr2,addr3,addr4,addr5;
    const states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ];

    beforeEach(async function () {
        [owner, addr1, addr2,addr3,addr4,addr5] = await ethers.getSigners();

        SwarajToken = await ethers.getContractFactory("SwarajToken");
        swarajToken = await SwarajToken.deploy();
        await swarajToken.waitForDeployment();;

        Parties = await ethers.getContractFactory("Parties");
        parties = await Parties.deploy();
        await parties.waitForDeployment();

        CentralVote = await ethers.getContractFactory("CentralVote");
        centralVote = await CentralVote.deploy(swarajToken.getAddress(), parties.getAddress(), "Central Election");
        await centralVote.waitForDeployment();

        await parties.addParty(1, "Democratic Party", "DP");
        await parties.addParty(2, "Democratic Republic", "DR");
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await centralVote.owner()).to.equal(owner.address);
        });

        it("Should set the correct vote type", async function () {
            expect(await centralVote.voteType()).to.equal("Central Election");
        });
    });

    describe("Candidate Registration", function () {
        it("Should allow only the owner to register a candidate", async function () {
            await expect(
                centralVote.connect(addr1).registerCandidate(1, "John Doe", "image-url")
            ).to.be.revertedWith("Not the owner");
        });

        it("Should register a candidate successfully", async function () {
            await expect(centralVote.registerCandidate(1, "John Doe", "image-url"))
                .to.emit(centralVote, "CandidateRegistered")
                .withArgs(1, "John Doe", 1);
        });

        it("Should not register a candidate with an empty name", async function () {
            await expect(centralVote.registerCandidate(1, "", "image-url"))
                .to.be.revertedWith("Candidate name is required");
        });
    });

    describe("Voting Mechanism", function () {
        beforeEach(async function () {
            await swarajToken.mint(owner.address, ethers.parseUnits("1000", 18));
            await swarajToken.connect(owner).depositGasFunds({ value: ethers.parseEther("0.005") });
            await swarajToken.connect(addr1).approve(centralVote.getAddress(), ethers.parseUnits("1", 18));
            await centralVote.registerCandidate(1, "John Doe", "image-url");

        });

        it("Should not allow voting for a non-existent candidate", async function () {
            await swarajToken.batchTransfer([addr1.address, addr2.address]);
            await expect(centralVote.connect(addr1).voteForCandidate(99, "Maharashtra"))
                .to.be.revertedWith("Candidate does not exist");
        });

        it("Should not allow voting without token balance", async function () {
            await swarajToken.connect(addr2).approve(centralVote.getAddress(), ethers.parseUnits("0.1", 18));
            await expect(centralVote.connect(addr2).voteForCandidate(1, "Maharashtra"))
                .to.be.revertedWith("Insufficient tokens");
        });

        it("Should not allow voting with insufficient allowance", async function () {
            await swarajToken.batchTransfer([addr1.address, addr2.address]);
            await swarajToken.connect(addr1).approve(centralVote.getAddress(), ethers.parseUnits("0.5", 18));
            await expect(centralVote.connect(addr1).voteForCandidate(1, "Maharashtra"))
                .to.be.revertedWith("Not enough allowance, approve more tokens");
        });

        states.forEach((state) => {
            it(`Should allow voting in ${state}`, async function () {
                await swarajToken.batchTransfer([addr1.address, addr2.address]);
                await expect(centralVote.connect(addr1).voteForCandidate(1, state))
                    .to.emit(centralVote, "VoteCasted")
                    .withArgs(addr1.address, 1, state, 1, 1);
            });
        });
    });

    describe("Security", function () {
        it("Should reject direct Ether transfers", async function () {
            
            await expect(
                owner.sendTransaction({ to: centralVote.getAddress(), value: ethers.parseEther("1") })
            ).to.be.reverted;
        });
    });

    describe("Full Testing" ,() => {
        it("Full functioning of test ", async () => {
            await swarajToken.mint(owner.address, ethers.parseUnits("1000", 18));
            await swarajToken.connect(owner).depositGasFunds({ value: ethers.parseEther("0.050") });
            await swarajToken.batchTransfer([addr1.address, addr2.address, addr3.address, addr4.address, addr5.address]);


            await swarajToken.connect(addr1).approve(centralVote.getAddress(), ethers.parseUnits("1", 18));
            await swarajToken.connect(addr2).approve(centralVote.getAddress(), ethers.parseUnits("1", 18));
            await swarajToken.connect(addr3).approve(centralVote.getAddress(), ethers.parseUnits("1", 18));
            await swarajToken.connect(addr4).approve(centralVote.getAddress(), ethers.parseUnits("1", 18));
            await swarajToken.connect(addr5).approve(centralVote.getAddress(), ethers.parseUnits("1", 18));

            await expect(centralVote.registerCandidate(1, "John Doe", "image-url"))
                .to.emit(centralVote, "CandidateRegistered")
                .withArgs(1, "John Doe", 1);
            await expect(centralVote.registerCandidate(1, "John Raj", "image-url"))
                .to.emit(centralVote, "CandidateRegistered")
                .withArgs(2, "John Raj", 1);
            await expect(centralVote.registerCandidate(1, "John Yash", "image-url"))
                .to.emit(centralVote, "CandidateRegistered")
                .withArgs(3, "John Yash", 1);

            // VoteCasted(msg.sender, candidateId, state,
            //  candidates[candidateId].totalVoteCount, candidates[candidateId].stateVoteCount[state]);

            await expect(centralVote.connect(addr1).voteForCandidate(1, "Maharashtra"))
                .to.emit(centralVote,"VoteCasted")
                .withArgs(addr1,1,"Maharashtra",1,1);
            await expect(centralVote.connect(addr2).voteForCandidate(1, "Maharashtra"))
                .to.emit(centralVote,"VoteCasted")
                .withArgs(addr2,1,"Maharashtra",2,2);
            await expect(centralVote.connect(addr3).voteForCandidate(1, "Bihar"))
                .to.emit(centralVote,"VoteCasted")
                .withArgs(addr3,1,"Bihar",3,1);
            await expect(centralVote.connect(addr4).voteForCandidate(2, "Maharashtra"))
                .to.emit(centralVote,"VoteCasted")
                .withArgs(addr4,2,"Maharashtra",1,1);
            await expect(centralVote.connect(addr5).voteForCandidate(2, "Bihar"))
                .to.emit(centralVote,"VoteCasted")
                .withArgs(addr5,2,"Bihar",2,1);


        })
    })
});
