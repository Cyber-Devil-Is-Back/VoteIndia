use std::str::FromStr;

use actix_multipart::form::{tempfile::TempFile, text::Text, MultipartForm};
use mongodb::bson::Bson;
use serde::{Deserialize, Serialize};



#[derive(MultipartForm,Debug)]
pub struct PartyForm {
    pub party_name: Text<String>,
    pub party_abbreviation: Text<String>,
    pub party_slogan: Text<String>,
    pub registration_date: Text<String>,
    pub party_description: Text<String>,
    pub party_type: Text<String>,
    pub party_email: Text<String>,
    pub party_password: Text<String>,
    pub party_website: Text<String>,
    pub phone_number: Text<String>,
    pub party_leader: Text<String>,
    pub party_founder: Text<String>,
    pub party_manifesto: Text<String>,
    pub state: Text<String>,
    pub party_logo:  TempFile,
    pub leader_image: TempFile,
}

#[derive(Serialize,Deserialize,PartialEq,Debug,Clone)]
pub enum PartyStatus {
    Approved,
    Pending,
    Rejected,
}
impl From<PartyStatus> for Bson {
    fn from(status: PartyStatus) -> Self {
        match status {
            PartyStatus::Pending => Bson::String("Pending".to_string()),
            PartyStatus::Approved => Bson::String("Approved".to_string()),
            PartyStatus::Rejected => Bson::String("Rejected".to_string()),
        }
    }
}
#[derive(Serialize, Deserialize,PartialEq, PartialOrd,Debug)]
pub enum PartyType {
    National,
    State,
}
impl FromStr for PartyType {
    type Err = String;
    
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "national" => Ok(PartyType::National),
            "state" => Ok(PartyType::State),
            _ => Err(format!("Invalid PartyType: {}", s)),
        }
    }
}

#[derive(Serialize,Deserialize,Debug)]
pub struct Party {
    pub _id: i64,
    pub name: String,
    pub party_abbreviation: String,
    pub party_slogan: String,
    pub registration_on: String,
    pub party_description: String,
    pub party_type: PartyType,
    pub party_email: String,
    pub party_password: String,
    pub party_website: String,
    pub phone_number: String,
    pub party_leader: String,
    pub party_founder: String,
    pub party_manifesto: String,
    pub party_logo:  String,
    pub state: String,
    pub leader_image: String,
    pub status: PartyStatus,
}
#[derive(Serialize,Deserialize,Debug)]
pub struct PartyLogin {
    pub _id: i64,
    pub party_email: String,
    pub party_password: String,
    pub party_type: PartyType,
    pub status: PartyStatus,
}
#[derive(Serialize,Deserialize)]
pub struct ApprovedParty{
    pub _id: i64,
    pub party_email: String,
    pub party_website: String,
    pub phone_number: String,
    pub party_leader: String,
    pub leader_image: String,
    pub status: PartyStatus,
}

#[derive(Serialize,Deserialize)]
pub struct PartyReturn {
    pub _id: i64,
    pub name: String,
    pub party_abbreviation: String,
    pub party_slogan: String,
    pub registration_on: String,
    pub party_description: String,
    pub party_type: PartyType,
    pub party_email: String,
    pub party_website: String,
    pub phone_number: String,
    pub party_leader: String,
    pub party_founder: String,
    pub party_manifesto: String,
    pub party_logo:  String,
    pub state: String,
    pub leader_image: String,
    pub status: PartyStatus,
}

#[derive(MultipartForm)]
pub struct RegisterStateCandidate{
    pub party_id: Text<String>,
    pub name: Text<String>,
    pub gender: Text<String>,
    pub image: TempFile,
    pub dob: Text<String>,
    pub state: Text<String>,
    pub district: Text<String>,
    pub constituency: Text<String>,
}
#[derive(Serialize,Deserialize)]
pub struct StateCandidate{
    pub party_id: String,
    pub name: String,
    pub gender: String,
    pub image: String,
    pub dob: String,
    pub state: String,
    pub district: String,
    pub constituency: String,
    pub status: PartyStatus,
}
#[derive(MultipartForm)]
pub struct RegisterNationalCandidate{
    pub party_id: Text<String>,
    pub name: Text<String>,
    pub gender: Text<String>,
    pub image: TempFile,
    pub dob: Text<String>,
    pub state: Text<String>,
    pub constituency: Text<String>,
}
#[derive(Serialize,Deserialize)]
pub struct NationalCandidate{
    pub party_id: String,
    pub name: String,
    pub gender: String,
    pub image: String,
    pub dob: String,
    pub state: String,
    pub constituency: String,
    pub status: PartyStatus,
}
#[derive(Deserialize,Debug)]
pub struct Status {
    pub id: u64,
    pub status: PartyStatus,
}