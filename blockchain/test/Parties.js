const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PartyRegistry Contract", function () {
  let PartyRegistry;
  let partyRegistry;
  let owner, addr1;

beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    PartyRegistry = await ethers.getContractFactory("PartyRegistry");
    partyRegistry = await PartyRegistry.deploy();
    await partyRegistry.waitForDeployment();
});

  describe("Deployment", function () {
    it("Should set the deployer as the owner", async function () {
      expect(await partyRegistry.owner()).to.equal(owner.address);
    });
  });

  describe("Party Registration", function () {
    it("Should allow owner to register a National party", async function () {
      await partyRegistry.registerParty(
        "Bharat National",
        "BN",
        "Unity for All",
        "2023-01-01",
        "A national party for unity.",
        0, // PartyType.National
        "QmManifestoHash",
        "QmLogoHash",
        "",
        "23-09-2023"
      );

      const party = await partyRegistry.getPartyById(1);
      expect(party.name).to.equal("Bharat National");
      expect(party.partyType).to.equal(0);
    });

    it("Should allow owner to register a State party", async function () {
      await partyRegistry.registerParty(
        "Assam Janata",
        "AJ",
        "Progress for Assam",
        "2024-02-02",
        "A regional state party.",
        1, // PartyType.State
        "QmManifestoHash2",
        "QmLogoHash2",
        "Assam",
        "23-09-2023"
      );

      const party = await partyRegistry.getPartyById(1);
      expect(party.state).to.equal("Assam");
      expect(party.partyType).to.equal(1);
    });

    it("Should fail if non-owner tries to register", async function () {
      await expect(
        partyRegistry.connect(addr1).registerParty(
          "Test Party",
          "TP",
          "Slogan",
          "2025-01-01",
          "Test description",
          0,
          "QmManifesto",
          "QmLogo",
          "",
          "23-09-2023"
        )
      ).to.be.revertedWith("Not authorized");
    });

    it("Should fail if party abbreviation is duplicate", async function () {
      await partyRegistry.registerParty(
        "First Party",
        "FP",
        "First slogan",
        "2025-01-01",
        "First desc",
        0,
        "QmFirstManifesto",
        "QmFirstLogo",
        "",
        "23-09-2023"
      );

      await expect(
        partyRegistry.registerParty(
          "Second Party",
          "FP",
          "Second slogan",
          "2025-01-01",
          "Second desc",
          0,
          "QmSecondManifesto",
          "QmSecondLogo",
          "",
          "23-09-2023"
        )
      ).to.be.revertedWith("Party abbreviation already exists");
    });

    it("Should fail if state is missing for State party", async function () {
      await expect(
        partyRegistry.registerParty(
          "State Party",
          "SP",
          "Slogan",
          "2025-01-01",
          "Desc",
          1, // State
          "QmManifesto",
          "QmLogo",
          "" ,
          "23-09-2023"// Missing state
        )
      ).to.be.revertedWith("State party must include a state");
    });

    it("Should fail if state is provided for National party", async function () {
      await expect(
        partyRegistry.registerParty(
          "National Party",
          "NP",
          "Slogan",
          "2025-01-01",
          "Desc",
          0, // National
          "QmManifesto",
          "QmLogo",
          "Punjab" ,
          "23-09-2023"// Invalid state
        )
      ).to.be.revertedWith("National party must not include state");
    });
  });

  describe("Get Party Functions", function () {
    beforeEach(async function () {
      await partyRegistry.registerParty(
        "Demo Party",
        "DP",
        "Demo slogan",
        "2023-12-31",
        "Demo description",
        0,
        "QmManifestoDemo",
        "QmLogoDemo",
        "",
        "23-09-2023"
      );
    });

    it("Should get party by ID", async function () {
      const party = await partyRegistry.getPartyById(1);
      expect(party.name).to.equal("Demo Party");
    });

    it("Should fail if party ID is invalid", async function () {
      await expect(partyRegistry.getPartyById(999)).to.be.revertedWith("Invalid party ID");
    });

    it("Should get party by name", async function () {
      const party = await partyRegistry.getPartyByName("Demo Party");
      expect(party.abbreviation).to.equal("DP");
    });

    it("Should fail if name not found", async function () {
      await expect(partyRegistry.getPartyByName("Ghost Party")).to.be.revertedWith("Party not found by name");
    });

    it("Should return all parties", async function () {
      const all = await partyRegistry.getAllParties();
      expect(all.length).to.equal(1);
    });

    it("Should return parties by type", async function () {
      const national = await partyRegistry.getAllPartiesByType(0);
      const state = await partyRegistry.getAllPartiesByType(1);

      expect(national.length).to.equal(1);
      expect(state.length).to.equal(0);
    });
  });
});
