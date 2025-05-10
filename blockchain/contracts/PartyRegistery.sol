// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PartyRegistry {
    address public owner;

    enum PartyType { National, State }

    struct Party {
        uint id;
        string name;
        string abbreviation;
        string slogan;
        string registrationOn;
        string description;
        PartyType partyType;
        string manifesto;
        string partyFounder;
        string logo;
        string state; // Empty for National parties
    }

    uint public nextPartyId = 1;
    mapping(uint => Party) public parties;
    uint[] public partyIds;

    event PartyRegistered(uint indexed partyId, string name, PartyType partyType);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        revert("No Ether accepted");
    }

    fallback() external payable {
        revert("Fallback call rejected");
    }

    function registerParty(uint256 _id,string memory _name,string memory _abbreviation,string memory _slogan,string memory _registrationOn,string memory _description,PartyType _partyType,string memory _manifesto,string memory _partyfounder,string memory _logo,string memory _state) public onlyOwner {
        for (uint i = 0; i < partyIds.length; i++) {
            require(
                keccak256(bytes(parties[partyIds[i]].abbreviation)) != keccak256(bytes(_abbreviation)),
                "Party abbreviation already exists"
            );
        }
        if (_partyType == PartyType.National) {
            require(bytes(_state).length == 0, "National party must not include state");
        } else {
            require(bytes(_state).length > 0, "State party must include a state");
        }

        parties[nextPartyId] = Party( _id, _name, _abbreviation, _slogan, _registrationOn, _description, _partyType, _manifesto, _partyfounder,_logo, _state);
        partyIds.push(nextPartyId);
        emit PartyRegistered(nextPartyId, _name, _partyType);
        nextPartyId++;
    }

    function getPartyById(uint256 _partyId) public view returns (Party memory) {
        require(_partyId > 0 && _partyId < nextPartyId, "Invalid party ID");
        Party memory p = parties[_partyId];
        return Party(  p.id,  p.name,  p.abbreviation,  p.slogan,  p.registrationOn,p.description,  p.partyType,  p.manifesto,p.partyFounder,  p.logo,  p.state);
    }

    function getPartyByName(string memory _name) public view returns (Party memory) {
        for (uint i = 0; i < partyIds.length; i++) {
            uint id = partyIds[i];
            if (keccak256(bytes(parties[id].name)) == keccak256(bytes(_name))) {
                Party memory p = parties[id];
                return Party( p.id, p.name, p.abbreviation, p.slogan, p.registrationOn, p.description,p.partyType, p.manifesto,p.partyFounder, p.logo, p.state);
            }
        }
        revert("Party not found by name");
    }

    function getAllPartiesByType(PartyType _type) public view returns (Party[] memory) {
        uint count = 0;
        for (uint i = 0; i < partyIds.length; i++) {
            if (parties[partyIds[i]].partyType == _type) {
                count++;
            }
        }

        Party[] memory result = new Party[](count);
        uint index = 0;

        for (uint i = 0; i < partyIds.length; i++) {
            uint id = partyIds[i];
            if (parties[id].partyType == _type) {
                Party memory p = parties[id];
                result[index++] = Party( p.id, p.name, p.abbreviation, p.slogan, p.registrationOn, p.description, p.partyType, p.manifesto,p.partyFounder, p.logo, p.state                );
            }
        }

        return result;
    }

    function getAllParties() public view returns (Party[] memory) {
        Party[] memory result = new Party[](partyIds.length);
        for (uint i = 0; i < partyIds.length; i++) {
            uint id = partyIds[i];
            Party memory p = parties[id];
            result[i] = Party( p.id, p.name, p.abbreviation, p.slogan, p.registrationOn, p.description,p.partyType, p.manifesto,p.partyFounder, p.logo, p.state);
        }
        return result;
    }
    function getPartyByState(string memory _state) public view returns (Party[] memory) {
    uint count = 0;

    for (uint i = 0; i < partyIds.length; i++) {
        Party memory p = parties[partyIds[i]];
        if (
            p.partyType == PartyType.State &&
            keccak256(bytes(p.state)) == keccak256(bytes(_state))
        ) {
            count++;
        }
    }

    Party[] memory result = new Party[](count);
    uint index = 0;

    for (uint i = 0; i < partyIds.length; i++) {
        uint id = partyIds[i];
        Party memory p = parties[id];
        if (
            p.partyType == PartyType.State &&
            keccak256(bytes(p.state)) == keccak256(bytes(_state))
        ) {
            result[index++] = Party( p.id, p.name, p.abbreviation, p.slogan, p.registrationOn, p.description, p.partyType, p.manifesto,p.partyFounder, p.logo, p.state);
        }
    }

    return result;
}

}
