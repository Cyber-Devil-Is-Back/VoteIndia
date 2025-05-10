// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface ISwarajToken {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
    function allowance(address user, address spender) external view returns (uint256);
}

interface IParties {
    function getParty(uint partyId) external view returns (string memory name,string memory symbol,uint256 registeredTime);
}

contract StateVote {
    address public owner;
    uint public year;
    string voteType;
    ISwarajToken public swarajToken;
    IParties public partiesContract;  

    struct Candidate {
        string name;
        string image;
        uint partieid; 
        uint votecount;

    }
    struct ReturnCantidate{
        string name;
        string image;
        uint partieid; 
        uint votecount;
        string symbol;
    }

    mapping(uint => Candidate) public candidate;
    mapping(string => uint[]) public stateCandidates;  

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor(address _tokenAddress, address _partiesAddress,string memory votetype) {
        swarajToken = ISwarajToken(_tokenAddress);
        partiesContract = IParties(_partiesAddress);
        year = block.timestamp;
        voteType = votetype;
        owner = msg.sender;
    }

    receive() external payable {
        revert("No Ether Allowed");
    }

    fallback() external payable {
        revert("No Ether Allowed");
    }

    function addCandidates(string memory name,uint id,uint partieid,string memory state,string memory image) public onlyOwner {

        require(bytes(candidate[id].name).length == 0, "Candidate Aleready exist");
        require(address(partiesContract) != address(0), "Parties contract is not set");
        // Verify that the party exists in the Parties contract
        (string memory partyName, , ) = partiesContract.getParty(partieid);
        require(bytes(partyName).length > 0, "Party does not exist");
        require(bytes(image).length > 0,"Image Should be provided");

        require(bytes(name).length > 0, "Candidate name is required");
        require(bytes(state).length > 0, "State name is required");


        candidate[id] = Candidate(name, image,partieid, 0);
        stateCandidates[state].push(id);
        emit CandidateAdded( name, partieid, 0);
    }

    function getCandidatesByState(string memory state) public view returns (ReturnCantidate[] memory) {
        require(bytes(state).length > 0, "State name is required");
        uint[] memory candidateIds = stateCandidates[state];
        uint length = candidateIds.length;

        ReturnCantidate[] memory candidatesList = new ReturnCantidate[](length);

        for (uint i = 0; i < length; i++) {
            uint candidateId = candidateIds[i];
            Candidate storage c = candidate[candidateId];

            // Fetch party symbol from the Parties contract
            (, string memory symbol,  ) = partiesContract.getParty(c.partieid);

            candidatesList[i] = ReturnCantidate({
                name: c.name,
                image:c.image,
                partieid: c.partieid,
                votecount: c.votecount,
                symbol: symbol
        });
    }

    return candidatesList;
}

   function voteForCandidate(uint candidateId) public {
    // Ensure candidate exists
    require(bytes(candidate[candidateId].name).length > 0, "Candidate does not exist");

    uint256 voteAmount = 1 * (10 ** swarajToken.decimals());

    // Ensure the voter has enough tokens
    uint256 voterBalance = swarajToken.balanceOf(msg.sender);
    require(voterBalance >= voteAmount, "Insufficient tokens");

    // Check if the voter has approved the required tokens
    uint256 allowance = swarajToken.allowance(msg.sender, address(this));
    require(allowance >= voteAmount, "Not enough allowance, approve more tokens");

    // Transfer token from voter to contract
    bool success = swarajToken.transferFrom(msg.sender, address(this), voteAmount);
    require(success, "Token transfer failed");

    // Increase the vote count for the candidate
    candidate[candidateId].votecount++;

    // Emit vote event
    emit VoteCasted(msg.sender, candidateId, candidate[candidateId].votecount);
}

    event CandidateAdded(string  name,uint id, uint votecount);
    event VoteCasted(address indexed voter, uint candidateId,uint votecount);
}
