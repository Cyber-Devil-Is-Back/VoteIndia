use std::{thread::sleep, time::Duration};
use web3::{contract::{tokens::Detokenize, Contract, Error, Options}, ethabi::Token, transports::Http, types::H256, Web3};
use super::{helper::{load_contract, Owner}, structures::{ConstutiencyResult, District, StateResult}};



pub struct Vidhansabha{
    pub contract: Contract<Http>,
    pub web3 : Web3<Http> ,
    pub owner: Owner
}

impl Vidhansabha {
    pub fn new(web3:Web3<Http>,contract_address:String) -> Vidhansabha{
        dotenv::dotenv().ok();
        let abi_path = std::env::var("VIDHANSABHA_CONTRACT_ABI").expect("VIDHANSABHA_CONTRACT_ABI must be set");
        let _contract= super::helper::load_contract(contract_address, abi_path, web3.clone()).unwrap();
        Vidhansabha { contract: _contract,web3:web3,owner:Owner::new()}
    }
     pub async fn confirm_transaction(&self, tx_hash: H256) -> Result<(), Error> {
        for _ in 0..10 { // Check up to 10 times
            if let Some(receipt) = self.web3.eth().transaction_receipt(tx_hash).await? {
                println!("Transaction confirmed in block: {:?}", receipt.block_number);
                return Ok(());
            }
            println!("Waiting for confirmation...");
            sleep(Duration::from_secs(15));
        }
        Err(Error::from("Transaction not confirmed".to_string()))
    }
    pub async fn register_candidate(&self,district:String,constutiency:String,candidateid:u128)  -> Result<(), web3::contract::Error> {
        let tx = self.contract.call("registerCandidate", (district,constutiency,candidateid), self.owner.unlock().await.unwrap(), web3::contract::Options::default()).await.unwrap();
        self.confirm_transaction(tx).await
    }
    pub async fn vote(&self,district:String,constutiency:String,candidateid:u128) ->Result<(), web3::contract::Error>{
        let tx = self.contract.call("vote", (district,constutiency,candidateid), self.owner.unlock().await.unwrap(), web3::contract::Options::default()).await.unwrap();
        self.confirm_transaction(tx).await
    }
    pub async fn get_constituency_data(&self,district:String,constutiency:String,candidateid:u128) -> Result<ConstutiencyResult,web3::contract::Error>{
        let result: Token = self.contract.query("getConstituencyData", (district,constutiency,candidateid), None, Options::default(), None).await.unwrap();
        let constutiency_result: ConstutiencyResult = ConstutiencyResult::from_tokens(result.into_array().unwrap()).unwrap();
        Ok(constutiency_result)
    }
    pub async fn get_district_data(&self,district:String) -> Result<District,web3::contract::Error>{
        let result: Token = self.contract.query("getDistrictData", (district), None, Options::default(), None).await.unwrap();
        let state_result: District = District::from_tokens(result.into_array().unwrap()).unwrap();
        Ok(state_result)
    }
    pub async  fn get_candidates_votes(&self,district:String,constutiency:String,candidateid:u128) -> Result<u128,web3::contract::Error>{
        let result: Token = self.contract.query("getCandidatesVotes", (district,constutiency,candidateid), None, Options::default(), None).await.unwrap();
        let votes: u128 = result.into_uint().unwrap().as_u64() as u128;
        Ok(votes)
    }
    
}