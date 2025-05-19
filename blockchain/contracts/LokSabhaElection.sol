// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ISwarajToken {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
    function allowance(address owner, address spender) external view returns (uint256);
}


contract LokSabhaElection {

    address public owner;
    uint256 public electionId;
    uint256 public electionStartTime;
    uint256 public registrationDeadline;
    uint256 public votingDeadline;
    ISwarajToken public swarajToken;


    struct CandidateInfo {
        uint256 id;
        uint256 votes;
    }

    struct ConstituencyInfo {
        string name;
        CandidateInfo[] candidates;
    }

    struct StateInfo {
        string name;
        ConstituencyInfo[] constituencies;
    }

    struct Candidate {
        uint256 id;
        uint256 votes;
    }

    struct Constituency {
        mapping(uint256 => Candidate) candidates;
        uint256[] candidateIds;
        string name;
    }

    struct State {
        mapping(string => Constituency) constituencies;
        string[] constituencyList;
        string name;
    }
    

    mapping(string => State) private states;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    modifier onlyAfterVotingStart() {
        require(block.timestamp > registrationDeadline, "Voting has not started yet");
        _;
    }

    modifier onlyBeforeRegistrationDeadline() {
        require(block.timestamp < registrationDeadline, "Registration deadline has passed");
        _;
    }

    constructor( uint256 _electionId, address _swarajToken) {
        require(_electionId != 0, "Election ID cannot be zero");
        require(_swarajToken != address(0), "Invalid token address");
        owner = msg.sender;
        electionId = _electionId;
        electionStartTime = block.timestamp;
        registrationDeadline = block.timestamp + 7 days; // 7 days for registration
        votingDeadline = registrationDeadline + 14 days; // 14 days for voting
        swarajToken = ISwarajToken(_swarajToken);
        
    }
    function addStateWithConstituencies(string memory stateName, string[] memory constituencies) external onlyOwner {
        require(bytes(stateName).length > 0, "Empty state");
        require(constituencies.length > 0, "No constituencies");

        State storage s = states[stateName];
        s.name = stateName;

        for (uint i = 0; i < constituencies.length; i++) {
            string memory cName = constituencies[i];
            require(bytes(cName).length > 0, "Empty constituency");
            s.constituencies[cName].name = cName;
            s.constituencies[cName].candidateIds.push(0); // dummy init
        }
}



    function registerCandidate( string memory stateName, string memory constituencyName, uint256 candidateId ) public onlyOwner onlyBeforeRegistrationDeadline {
        require(candidateId != 0, "Candidate ID cannot be zero");
        State storage state = states[stateName];
        if (bytes(state.name).length == 0) {
            state.name = stateName;
        }
        Constituency storage constituency = state.constituencies[constituencyName];
        if (bytes(constituency.name).length == 0) {
            constituency.name = constituencyName;
            state.constituencyList.push(constituencyName);
        }
        Candidate storage candidate = constituency.candidates[candidateId];
        require(candidate.id == 0, "Candidate already registered");
        candidate.id = candidateId;
        candidate.votes = 0;
        constituency.candidateIds.push(candidateId);
    }
    function castVote( string memory stateName, string memory constituencyName, uint256 candidateId) public onlyAfterVotingStart {
        require(block.timestamp < votingDeadline, "Voting has ended");

        Candidate storage candidate = states[stateName].constituencies[constituencyName].candidates[candidateId];
        require(candidate.id != 0, "Candidate not registered");

        candidate.votes++;
    }

    function getElectionResultsByState(string memory stateName) public view returns (StateInfo memory) {
        State storage state = states[stateName];
        uint256 constituencyCount = state.constituencyList.length;

        ConstituencyInfo[] memory constituenciesInfo = new ConstituencyInfo[](constituencyCount);

        for (uint256 i = 0; i < constituencyCount; i++) {
            string memory constName = state.constituencyList[i];
            Constituency storage constituency = state.constituencies[constName];

            uint256 candidateCount = constituency.candidateIds.length;
            CandidateInfo[] memory candidatesInfo = new CandidateInfo[](candidateCount);

            for (uint256 j = 0; j < candidateCount; j++) {
                uint256 candidateId = constituency.candidateIds[j];
                Candidate storage candidate = constituency.candidates[candidateId];

                candidatesInfo[j] = CandidateInfo({
                    id: candidate.id,
                    votes: candidate.votes
                });
            }

            constituenciesInfo[i] = ConstituencyInfo({
                name: constName,
                candidates: candidatesInfo
            });
        }

        return StateInfo({
            name: state.name,
            constituencies: constituenciesInfo
        });
    }

    function getElectionDetails()
        public
        view
        returns (
            uint256 _electionId,
            uint256 _startTime,
            uint256 _registrationDeadline,
            uint256 _votingDeadline
        )
    {
        return (electionId, electionStartTime, registrationDeadline, votingDeadline);
    }
}
