// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISwarajToken {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract VidhanSabhaElection {
    ISwarajToken public token;
    address public admin;
    uint256 public voteCost = 1 * 10 ** 18;
    uint256 public electionDate;
    string public state;

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

    constructor(address tokenAddress, string memory _state, uint256 _electionDate) {
        require(tokenAddress != address(0), "Invalid token address");
        require(bytes(_state).length > 0, "Invalid state name");
        token = ISwarajToken(tokenAddress);
        state = _state;
        admin = msg.sender;
        electionDate = _electionDate;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    // ✅ Optimized Candidate Registration (with district + constituency)
    function registerCandidate(
        string memory districtName,
        string memory constituencyName,
        uint256 candidateId
    ) external onlyAdmin {
        require(bytes(districtName).length > 0, "Invalid district name");
        require(bytes(constituencyName).length > 0, "Invalid constituency name");
        require(candidateId > 0, "Invalid candidate ID");

        District storage d = districts[districtName];
        if (bytes(d.name).length == 0) {
            d.name = districtName;
            districtNames.push(districtName);
        }

        Constituency storage c = d.constituencies[constituencyName];
        if (bytes(c.name).length == 0) {
            c.name = constituencyName;
            d.constituencyNames.push(constituencyName);
        }

        require(c.candidates[candidateId].candidateId == 0, "Candidate exists");

        c.candidateIds.push(candidateId);
        c.candidates[candidateId] = Candidate(candidateId, 0);
    }

    // ✅ Voting
    function vote(string memory districtName, string memory constituencyName, uint256 candidateId) external {
        require(token.balanceOf(msg.sender) >= voteCost, "Insufficient token balance");

        Constituency storage c = districts[districtName].constituencies[constituencyName];
        require(c.candidates[candidateId].candidateId != 0, "Candidate not found");

        bool success = token.transferFrom(msg.sender, address(this), voteCost);
        require(success, "Token transfer failed");

        c.candidates[candidateId].voteCount += 1;
    }

    // ✅ View Functions
    function getAllDistricts() external view returns (string[] memory) {
        return districtNames;
    }

    function getConstituenciesByDistrict(string memory districtName) external view returns (string[] memory) {
        return districts[districtName].constituencyNames;
    }

    function getCandidateIds(string memory districtName, string memory constituencyName) external view returns (uint256[] memory) {
        return districts[districtName].constituencies[constituencyName].candidateIds;
    }

    function getCandidateVotes(string memory districtName, string memory constituencyName, uint256 candidateId) external view returns (uint256) {
        return districts[districtName].constituencies[constituencyName].candidates[candidateId].voteCount;
    }

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
