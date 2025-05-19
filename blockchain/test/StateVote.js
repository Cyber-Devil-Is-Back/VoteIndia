const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LegislativeAssemblyElection", function () {
let election, token;
let owner, voter1, voter2;
const voteCost = ethers.parseEther("1");

beforeEach(async function () {
[owner, voter1, voter2] = await ethers.getSigners();

const Token = await ethers.getContractFactory("SwarajToken");
token = await Token.deploy();
await token.waitForDeployment();

// Mint 10 tokens to owner
await token.mint(ethers.parseEther("10"));

// Transfer tokens to voters
await token.transfer(voter1.address, voteCost);
await token.transfer(voter2.address, voteCost);

// Deploy Election
const Election = await ethers.getContractFactory("LegislativeAssemblyElection");
election = await Election.deploy(token.address, voteCost);
await election.waitForDeployment();

// Setup election
await election.addDistrict("Bihar");
await election.addConstituency("Bihar", "Patna Sahib");
await election.registerCandidate("Bihar", "Patna Sahib", 101);
await election.registerCandidate("Bihar", "Patna Sahib", 102);

// Approvals
await token.connect(voter1).approve(election.address, voteCost);
await token.connect(voter2).approve(election.address, voteCost);
});

it("allows a voter to vote once", async function () {
    await election.connect(voter1).vote("Bihar", "Patna Sahib", 101);
    const constituency = await election.getConstituencyData("Bihar", "Patna Sahib");
    expect(constituency.candidates[0].voteCount).to.equal(1);
});

it("rejects voting twice without extra tokens", async function () {
    await election.connect(voter1).vote("Bihar", "Patna Sahib", 101);
    await expect(
    election.connect(voter1).vote("Bihar", "Patna Sahib", 102)
    ).to.be.revertedWith("Insufficient token balance");
});

it("returns structured constituency data", async function () {
    await election.connect(voter2).vote("Bihar", "Patna Sahib", 101);
    await election.connect(voter2).vote("Bihar", "Patna Sahib", 102);

    const data = await election.getConstituencyData("Bihar", "Patna Sahib");
    expect(data.name).to.equal("Patna Sahib");
    expect(data.candidates.length).to.equal(2);
    expect(data.candidates[0].voteCount.add(data.candidates[1].voteCount)).to.equal(2);
});

it("returns structured district data", async function () {
const data = await election.getDistrictData("Bihar");
expect(data.name).to.equal("Bihar");
expect(data.constituencies.length).to.equal(1);
expect(data.constituencies[0].name).to.equal("Patna Sahib");
});

it("prevents duplicate district and constituency", async function () {
await expect(election.addDistrict("Bihar")).to.be.revertedWith("District exists");
await expect(election.addConstituency("Bihar", "Patna Sahib")).to.be.revertedWith("Constituency exists");
});

it("prevents duplicate candidate registration", async function () {
await expect(election.registerCandidate("Bihar", "Patna Sahib", 101)).to.be.revertedWith("Candidate exists");
});

it("prevents voting with no tokens", async function () {
const [_, __, ___, emptyVoter] = await ethers.getSigners();
await expect(
election.connect(emptyVoter).vote("Bihar", "Patna Sahib", 101)
).to.be.revertedWith("Insufficient token balance");
});
});