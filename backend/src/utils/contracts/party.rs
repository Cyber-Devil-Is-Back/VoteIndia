use web3::contract::{Contract, Error, Options, tokens::Detokenize};
use web3::ethabi::Token;
use web3::transports::Http;
use web3::types::{U256, U64};
use web3::Web3;

use super::helper::Owner;


#[derive(Debug, Clone)]
pub  struct PartyData {
    pub id: u64,
    pub name: String,
    pub abbreviation: String,
    pub slogan: String,
    pub registered_on: String,
    pub description: String,
    pub party_type: u8,
    pub manifesto: String,
    pub founder:String,
    pub logo: String,
    pub state: String,
}

impl  Detokenize for PartyData {
    fn from_tokens(tokens: Vec<Token>) -> Result<Self, web3::contract::Error> {
        if tokens.len() != 11 {
            return Err(web3::contract::Error::InvalidOutputType(format!(
                "Expected 10 tokens, got {}",
                tokens.len()
            )));
        }
        Ok(PartyData {
            id: tokens[0].clone().into_uint().unwrap().as_u64(),
            name: tokens[1].clone().to_string(),
            abbreviation: tokens[2].clone().to_string(),
            slogan: tokens[3].clone().to_string(),
            description: tokens[4].clone().to_string(),
            party_type: tokens[5].clone().into_uint().unwrap().as_u64() as u8,
            manifesto: tokens[6].clone().to_string(),
            founder: tokens[7].clone().to_string(),
            logo: tokens[7].clone().to_string(),
            state: tokens[8].clone().to_string(),
            registered_on: tokens[9].clone().to_string(),
        })
    }
    
}
pub struct  PartyRegisterClient{
    pub contract: Contract<Http>,
    pub owner: Owner,
    pub web3: Web3<Http>,
}

impl PartyRegisterClient {
    pub fn new(web3: Web3<Http>) -> PartyRegisterClient {
        dotenv::dotenv().ok();
        let contract_address = std::env::var("PARTIES_CONTRACT_ADDRESS").expect("PARTIES_CONTRACT_ADDRESS must be set");
        let abi_path = std::env::var("PARTIES_CONTRACT_ABI").expect("PARTIES_CONTRACT_ABI must be set");
        let contract = super::helper::load_contract(contract_address, abi_path, web3.clone()).unwrap();
        PartyRegisterClient { contract, owner: Owner::new(), web3 }
    }
    pub async fn register_party(&mut self,_id:U256, name: &str, abbreviation: &str, slogan: &str, registered_on: &str, description: &str, party_type: u8,  manifesto: &str,founder:&str, logo: &str, state: &str) ->Result<bool, Error> {
        let option = Options {
            gas: Some(3_000_000.into()),
            ..Default::default()
        };
        self.owner.unlock().await.unwrap();
        let tx = self.contract.signed_call_with_confirmations
                            ("registerParty",
                             (_id.clone(),name.to_string(),abbreviation.to_string(),slogan.to_string(),registered_on.to_string(),description.to_string(),
                             party_type,manifesto.to_string(),founder.to_string(),logo.to_string(),state.to_string()
                            ), 
                            option,
                            1,
                            &mut self.owner.pkey).await.unwrap();
         match self.web3.eth().transaction_receipt(tx.transaction_hash).await.unwrap() {
                    Some(receipt) => {
                        if receipt.status == Some(U64::from(1)) {
                            return Ok(true);
                        } else {
                            return Err(Error::from("ID Exist".to_string()));
                        }
                    }
                    None => Err(Error::from("Transaction receipt not found. Try increasing gas.".to_string())),
                }
    }
    pub async fn get_party_by_id(&self, party_id: U256) -> Result<PartyData, Error> {
        let result = self.contract.query("getPartyById", (party_id,), None, Options::default(), None).await?;
        let party_data: PartyData = PartyData::from_tokens(result)?;
        Ok(party_data)
    }
    pub async fn get_party_by_name(&self, party_name: &str) -> Result<PartyData, Error> {
        let result = self.contract.query("getPartyByName", (party_name.to_string(),), None, Options::default(), None).await?;
        let party_data: PartyData = PartyData::from_tokens(result)?;
        Ok(party_data)
    }

    pub async fn get_all_parties(&self) -> Result<Vec<PartyData>, Error> {
        let result: Vec<Vec<Token>> = self.contract.query("getAllParties", (), None, Options::default(), None).await?;
        let parties: Vec<PartyData> = result.into_iter().map(|token| PartyData::from_tokens(token)).collect::<Result<Vec<_>, _>>()?;
        Ok(parties)
    }
    pub async fn get_party_by_state(&self, state: &str) -> Result<Vec<PartyData>, Error> {
        let result: Vec<Vec<Token>> = self.contract.query("getPartyByState", (state.to_string(),), None, Options::default(), None).await?;
        let parties: Vec<PartyData> = result.into_iter().map(|token| PartyData::from_tokens(token)).collect::<Result<Vec<_>, _>>()?;
        Ok(parties)
    }
    pub async fn get_all_parties_by_type(&self, party_type: u8) -> Result<Vec<PartyData>, Error> {
        let result: Vec<Vec<Token>> = self.contract.query("getAllPartiesByType", (party_type,), None, Options::default(), None).await?;
        let parties: Vec<PartyData> = result.into_iter().map(|token| PartyData::from_tokens(token)).collect::<Result<Vec<_>, _>>()?;
        Ok(parties)
    }
}