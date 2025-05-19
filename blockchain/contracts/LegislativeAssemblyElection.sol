// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISwarajToken {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract LegislativeAssemblyElection {
     ISwarajToken public token;
    address public admin;
    uint256 public voteCost;

    struct Candidate {
        uint256 candidateId;
        uint256 voteCount;
    }

    struct Constituency {
        string name;
        uint256[] candidateIds;
        mapping(uint256 => Candidate) candidates;
    }

    struct District {
        string name;
        string[] constituencyNames;
        mapping(string => Constituency) constituencies;
    }

    struct CandidateData {
        uint256 candidateId;
        uint256 voteCount;
    }

    struct ConstituencyData {
        string name;
        CandidateData[] candidates;
    }

    struct DistrictData {
        string name;
        ConstituencyData[] constituencies;
    }

    mapping(string => District) private districts;
    string[] private districtNames;

    constructor(address tokenAddress, uint256 _voteCost) {
        token = ISwarajToken(tokenAddress);
        admin = msg.sender;
        voteCost = _voteCost; // e.g. 1 token = 1 vote
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    // Admin functions
    function addDistrict(string memory districtName) external onlyAdmin {
        require(bytes(districtName).length > 0, "Invalid name");
        require(bytes(districts[districtName].name).length == 0, "District exists");
        districts[districtName].name = districtName;
        districtNames.push(districtName);
    }

    function addConstituency(string memory districtName, string memory constituencyName) external onlyAdmin {
        District storage d = districts[districtName];
        require(bytes(d.name).length > 0, "District not found");
        require(bytes(d.constituencies[constituencyName].name).length == 0, "Constituency exists");
        d.constituencyNames.push(constituencyName);
        d.constituencies[constituencyName].name = constituencyName;
    }

    function registerCandidate(string memory districtName, string memory constituencyName, uint256 candidateId) external onlyAdmin {
        Constituency storage c = districts[districtName].constituencies[constituencyName];
        require(bytes(c.name).length > 0, "Constituency not found");
        require(c.candidates[candidateId].candidateId == 0, "Candidate exists");
        c.candidateIds.push(candidateId);
        c.candidates[candidateId] = Candidate(candidateId, 0);
    }

    // Vote function
    function vote(string memory districtName, string memory constituencyName, uint256 candidateId) external {
        require(token.balanceOf(msg.sender) >= voteCost, "Insufficient token balance");

        Constituency storage c = districts[districtName].constituencies[constituencyName];
        require(bytes(c.name).length > 0, "Constituency not found");
        require(c.candidates[candidateId].candidateId != 0, "Invalid candidate");

        bool success = token.transferFrom(msg.sender, address(this), voteCost);
        require(success, "Token transfer failed");

        c.candidates[candidateId].voteCount += 1;
    }

    // View functions
    function getConstituenciesByDistrict(string memory districtName) external view returns (string[] memory) {
        return districts[districtName].constituencyNames;
    }

    function getCandidateIds(string memory districtName, string memory constituencyName) external view returns (uint256[] memory) {
        return districts[districtName].constituencies[constituencyName].candidateIds;
    }

    function getCandidateVotes(string memory districtName, string memory constituencyName, uint256 candidateId) external view returns (uint256) {
        return districts[districtName].constituencies[constituencyName].candidates[candidateId].voteCount;
    }

    function getAllDistricts() external view returns (string[] memory) {
        return districtNames;
    }

    // 🆕 New: Get all candidate data in a constituency
     function getConstituencyData(string memory districtName, string memory constituencyName)
        external
        view
        returns (ConstituencyData memory)
    {
        Constituency storage c = districts[districtName].constituencies[constituencyName];
        uint256 len = c.candidateIds.length;

        CandidateData[] memory candidateList = new CandidateData[](len);
        for (uint256 i = 0; i < len; i++) {
            uint256 id = c.candidateIds[i];
            Candidate storage candidate = c.candidates[id];
            candidateList[i] = CandidateData({candidateId: id, voteCount: candidate.voteCount});
        }

        return ConstituencyData({name: c.name, candidates: candidateList});
    }

    function getDistrictData(string memory districtName) external view returns (DistrictData memory) {
        District storage d = districts[districtName];
        uint256 cLen = d.constituencyNames.length;

        ConstituencyData[] memory allConstituencies = new ConstituencyData[](cLen);
        for (uint256 i = 0; i < cLen; i++) {
            string memory cname = d.constituencyNames[i];
            Constituency storage c = d.constituencies[cname];
            uint256 len = c.candidateIds.length;

            CandidateData[] memory candidateList = new CandidateData[](len);
            for (uint256 j = 0; j < len; j++) {
                uint256 id = c.candidateIds[j];
                Candidate storage candidate = c.candidates[id];
                candidateList[j] = CandidateData({candidateId: id, voteCount: candidate.voteCount});
            }

            allConstituencies[i] = ConstituencyData({name: cname, candidates: candidateList});
        }

        return DistrictData({name: d.name, constituencies: allConstituencies});
    }
}
