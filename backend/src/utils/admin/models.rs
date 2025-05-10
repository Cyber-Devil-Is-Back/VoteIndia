use serde::{Serialize, Deserialize};


#[derive(Debug, Serialize, Deserialize)]
pub struct Admin{
    pub id: i64,
    pub username: String,
    pub password: String,
    pub image: String,
    pub email: String,
    pub is_admin:bool
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Candidate {
    pub id: i64,
    pub name: String,
    pub party: String,
    pub description: String,
    pub walletaddress: String,
}
