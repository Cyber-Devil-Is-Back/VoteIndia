// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ISwarajToken {
function balanceOf(address account) external view returns (uint256);
function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
function decimals() external view returns (uint8);
function allowance(address user, address spender) external view returns (uint256);
}

contract LokSabhaElection {
    ISwarajToken public token;
    uint256 public voteCost = 1 * 10 ** 18; // 1 token = 1 vote
    address public admin;
    uint256 public electiondate;
    uint256 public candidatesRegistrationEndDate;
    uint256 public votingEndDate;


    struct Candidate {
        uint256 id;
        uint256 voteCount;
    }

    struct Constituency {
        string name;
        Candidate[] candidates;
        mapping(uint256 => uint256) candidateIndex; // candidateId => index + 1
    }

    struct State {
        string name;
        mapping(string => Constituency) constituencies;
        string[] constituencyNames;
        mapping(string => bool) constituencyExists;
    }

    mapping(string => State) private states;
    string[] public stateNames;
    mapping(string => bool) private stateExists;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor(address _tokenAddress,uint256 _date) {
        token = ISwarajToken(_tokenAddress);
        admin = msg.sender;
        electiondate = _date; 
    
    }
    modifier votingEndDatePassed() {
        require(block.timestamp > votingEndDate, "Voting period is not over");
        _;
    }

    function registerCandidate(string memory stateName, string memory constituencyName, uint256 candidateId) public  onlyAdmin {
        require(stateExists[stateName], "State not found");
        require(states[stateName].constituencyExists[constituencyName], "Constituency not found");
        require(candidateId > 0, "Invalid candidate ID");
        State storage state = states[stateName];
        Constituency storage constituency = state.constituencies[constituencyName];
        require(constituency.candidateIndex[candidateId] == 0, "Candidate already exists");

        constituency.candidates.push(Candidate(candidateId, 0));
        constituency.candidateIndex[candidateId] = constituency.candidates.length; // store index+1
    }

    function vote(string memory stateName, string memory constituencyName, uint256 candidateId) public  {
        require(stateExists[stateName], "State not found");
        require(states[stateName].constituencyExists[constituencyName], "Constituency not found");
        require(candidateId > 0, "Invalid candidate ID");
        require(states[stateName].constituencies[constituencyName].candidateIndex[candidateId] > 0, "Candidate not found");
        require(token.balanceOf(msg.sender) >= voteCost, "Insufficient token balance");

        // Transfer tokens to the election contract (burn/vault)
        require(token.transferFrom(msg.sender, address(this), voteCost), "Token transfer failed");

        State storage state = states[stateName];
        Constituency storage constituency = state.constituencies[constituencyName];

        uint256 idx = constituency.candidateIndex[candidateId];
        require(idx > 0, "Candidate not found");

        constituency.candidates[idx - 1].voteCount += 1;
    }

    // Struct for external return (for Constituency)
    struct CandidateResult {
        uint256 id;
        uint256 voteCount;
    }

    struct ConstituencyResult {
        string name;
        CandidateResult[] candidates;
    }

    struct StateResult {
        string name;
        ConstituencyResult[] constituencies;
    }

    function getConstituencyData(string memory stateName, string memory constituencyName) public view returns (ConstituencyResult memory result) {
        Constituency storage constituency = states[stateName].constituencies[constituencyName];
        result.name = constituency.name;

        uint256 len = constituency.candidates.length;
        result.candidates = new CandidateResult[](len);
        for (uint256 i = 0; i < len; i++) {
            Candidate storage c = constituency.candidates[i];
            result.candidates[i] = CandidateResult(c.id, c.voteCount);
        }
    }

    function getStateData(string memory stateName) public view returns (StateResult memory result) {
        State storage state = states[stateName];
        result.name = state.name;
        uint256 len = state.constituencyNames.length;
        result.constituencies = new ConstituencyResult[](len);

        for (uint256 i = 0; i < len; i++) {
            string memory cName = state.constituencyNames[i];
            Constituency storage constituency = state.constituencies[cName];

            uint256 cLen = constituency.candidates.length;
            CandidateResult[] memory cResults = new CandidateResult[](cLen);
            for (uint256 j = 0; j < cLen; j++) {
                cResults[j] = CandidateResult(constituency.candidates[j].id, constituency.candidates[j].voteCount);
            }

            result.constituencies[i] = ConstituencyResult(constituency.name, cResults);
        }
    }

    function getAllState() public view returns (string[] memory) {
        return stateNames;
    }

    function getConstituency(string memory stateName) public view returns (string[] memory) {
        return states[stateName].constituencyNames;
    }
}