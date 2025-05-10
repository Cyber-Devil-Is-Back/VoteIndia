// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.19;

// interface ISwarajToken {
//     function balanceOf(address account) external view returns (uint256);
//     function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
//     function decimals() external view returns (uint8);
//     function allowance(address user, address spender) external view returns (uint256);
// }

// interface IParties {
//     function getNationalPartyById(uint _partyId) external  view returns (uint partyid,string memory partyname,string memory partysymbol,string memory partylogo,uint256 registeredtime);
// }



// contract NationalElection {
//     address public owner;
//     uint256 public electionYear;
//     uint256 public electedCandiadteId;
//     ISwarajToken public swarajToken;
//     IParties public partiesContract;

//     string[29] public states = [
//     "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
//     "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
//     "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
//     "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
//     "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
//     "Uttar Pradesh", "Uttarakhand", "West Bengal"];

//     struct States{
//         string statename;
//         uint256 votecount;
//     }

//     struct Candidate {
//         uint256 partyId;
//         string name;
//         string image;
//         uint256 totalVoteCount;
//         mapping(string => uint) statesvotes;
//     }



//     mapping(uint256 => Candidate) public candidates;
//     uint256 public candidateCount;

//     modifier onlyOwner() {
//         require(msg.sender == owner, "Not the owner");
//         _;
//     }

//     event CandidateRegistered(uint256 candidateId, string name, uint256 partyId);

//     event VoteCasted(address indexed voter, uint256 candidateId, string state, uint256 totalVotes, uint256 stateVotes);

//     constructor(address _tokenAddress, address _partiesAddress) {
//         swarajToken = ISwarajToken(_tokenAddress);
//         partiesContract = IParties(_partiesAddress);
//         electionYear = block.timestamp;
//         owner = msg.sender;
//     }

//     function getYear() public view returns (uint year){
//         return electionYear;
//     }
//     function electedCandiadte(uint256 electedid) public onlyOwner {
//         electedCandiadteId = electedid;
//     }

//     function getElectedCandidate () public view return ()

//     function registerCandidate(uint partyid, string memory name, string memory image) public onlyOwner {
//         require(bytes(name).length > 0, "Candidate name is required");
//         require(bytes(image).length > 0, "Image should be provided");

//         (, string memory partyName, , , ) = partiesContract.getNationalPartyById(partyid);
//         require(bytes(partyName).length > 0, "Party does not exist");

//         candidateCount++;

//         Candidate storage newCandidate = candidates[candidateCount];
//         newCandidate.partyId = partyid;
//         newCandidate.name = name;
//         newCandidate.image = image;
//         newCandidate.totalVoteCount = 0;

//         // Initialize state-wise votes
//         for (uint i = 0; i < states.length; i++) {
//             newCandidate.statesvotes[states[i]] = 0; // Initialize vote count to 0
//         }

//         // Emit event for successful registration
//         emit CandidateRegistered(candidateCount, name, partyid);
//     }


//     function voteForCandidate(uint256 candidateId, string memory state) public {
//         require(candidateId > 0 && candidateId <= candidateCount, "Candidate does not exist");
//         require(bytes(state).length > 0, "State name is required");
//         require(isValidState(state), "Invalid state name"); // Ensure state exists

//         uint256 voteAmount = 1 * (10 ** swarajToken.decimals());
//         uint256 voterBalance = swarajToken.balanceOf(msg.sender);
//         require(voterBalance >= voteAmount, "Insufficient tokens");

//         uint256 allowance = swarajToken.allowance(msg.sender, address(this));
//         require(allowance >= voteAmount, "Not enough allowance, approve more tokens");

//         // Transfer tokens before updating votes (reentrancy protection)
//         require(swarajToken.transferFrom(msg.sender, address(this), voteAmount), "Token transfer failed");

//         // Update candidate vote counts
//         candidates[candidateId].totalVoteCount++;
//         candidates[candidateId].statesvotes[state]++; // Fixed mapping reference

//         emit VoteCasted(msg.sender, candidateId, state, candidates[candidateId].totalVoteCount, candidates[candidateId].statesvotes[state]);
//     }

//     /**
//      * @dev Checks if the provided state name is valid.
//      * @param state The state name to validate.
//      * @return bool True if the state exists, otherwise false.
//      */
//     function isValidState(string memory state) internal view returns (bool) {
//         for (uint i = 0; i < states.length; i++) {
//             if (keccak256(abi.encodePacked(states[i])) == keccak256(abi.encodePacked(state))) {
//                 return true;
//             }
//         }
//         return false;
//     }


//     function getCandidate(uint256 candidateId) public view returns (uint candidateid,string memory conadidatename,string memory image,uint totalvote,string memory partyname,string memory partysymbol,string memory partylogo) {
//         require(candidateId > 0 && candidateId <= candidateCount, "Candidate does not exist");

//         Candidate storage candidate = candidates[candidateId];
//         (,string memory _partyname,string memory _partysymbol,string memory _partylogo, ) = partiesContract.getNationalPartyById(candidate.partyId);

//         return (candidateId,candidate.name,candidate.image,candidate.totalVoteCount,_partyname,_partysymbol,_partylogo);
//     }

//     function getCandidateVotesByState(uint256 _candidateid, string memory state) public view returns (uint candidateid, string memory candidatename, string memory image, uint statevote, string memory partyname, string memory partysymbol,string memory partylogo) {
//         require(_candidateid > 0 && _candidateid <= candidateCount, "Candidate does not exist");
//         require(bytes(state).length > 0, "State name is required");

//         Candidate storage candidate = candidates[_candidateid];
//          (,string memory _partyname,string memory _partysymbol,string memory _partylogo, )  = partiesContract.getNationalPartyById(candidate.partyId);

//         return (_candidateid, candidate.name, candidate.image, candidate.statesvotes[state], _partyname,_partysymbol, _partylogo);
//     }

//     function getCandidateVotes(uint256 _candidateid) public view returns (uint candidateid, string memory candidatename, string memory image, uint totalvote, string memory partyname, string memory partysymbol,string memory partylogo,States[] memory ) {
//         require(_candidateid > 0 && _candidateid <= candidateCount, "Candidate does not exist");

//         Candidate storage candidate = candidates[_candidateid];
//         States[] memory statewiseVotes = new States[](states.length);

//         for (uint i = 0; i < states.length; i++) {
//             statewiseVotes[i] = States({
//                 statename: states[i],
//                 votecount: candidate.statesvotes[states[i]]
//             });
//         }
//         (,string memory _partyname,string memory _partysymbol,string memory _partylogo, )  = partiesContract.getNationalPartyById(candidate.partyId);

//         return (_candidateid, candidate.name, candidate.image, candidate.totalVoteCount, _partyname,_partysymbol, _partylogo,statewiseVotes);
//     }
// }
