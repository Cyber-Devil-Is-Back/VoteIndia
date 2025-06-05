
use std::{thread::sleep, time::Duration};
use web3::{contract::{tokens::Detokenize, Contract, Error, Options}, ethabi::Token, transports::Http, types::H256, Web3};
use super::{helper::{load_contract, Owner}, structures::{ConstutiencyResult, StateResult}};


pub struct LokSabha{
    contract: Contract<Http>,
    web3 : Web3<Http> ,
    owner: Owner
}
#[allow(dead_code)]
impl LokSabha {
    pub fn new(web3:Web3<Http>,contract_address:String) -> LokSabha{
        dotenv::dotenv().ok();
        let abi_path = std::env::var("LOKSABHA_CONTRACT_ABI").expect("LOKSABHA_CONTRACT_ABI must be set");
        let _contract= load_contract(contract_address, abi_path, web3.clone()).unwrap();
        LokSabha { contract: _contract,web3:web3,owner:Owner::new()}
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
    pub async  fn register_candidate(&self,state:String,constutiency:String,candidateid:u128)  -> Result<(), Error> {
        let tx = self.contract.call("registerCandidate", (state,constutiency,candidateid), self.owner.unlock().await.unwrap(), Options::default()).await.unwrap();
        self.confirm_transaction(tx).await
    }

    pub async fn vote(&self,state:String,constutiency:String,candidateid:u128) ->Result<(), Error>{
        let tx = self.contract.call("vote", (state,constutiency,candidateid), self.owner.unlock().await.unwrap(), Options::default()).await.unwrap();
        self.confirm_transaction(tx).await
    } 
    pub async fn get_constituency_data(&self,state:String,constutiency:String,candidateid:u128) -> Result<ConstutiencyResult,Error>{
        let result: Token = self.contract.query("getConstituencyData", (state,constutiency,candidateid), None, Options::default(), None).await.unwrap();
        let state_result: ConstutiencyResult = ConstutiencyResult::from_tokens(result.into_array().unwrap()).unwrap();
        Ok(state_result)
    }
    pub async fn get_state_data(&self,state:String) -> Result<StateResult,Error>{
        let result: Token = self.contract.query("getStateData", (state,), None, Options::default(), None).await.unwrap();
        let state_result: StateResult = StateResult::from_tokens(result.into_array().unwrap()).unwrap();
        Ok(state_result)
    }
    pub async fn  get_all_states(&self) -> Result<Vec<String>,Error>{
        let result: Token = self.contract.query("getAllStates", (), None, Options::default(), None).await.unwrap();
        let states: Vec<String> = result.into_array().unwrap().into_iter().map(|token| token.into_string().unwrap()).collect();
        Ok(states)
    }
    pub async fn get_all_constituencies(&self,state:String) -> Result<Vec<String>,Error>{
        let result: Token = self.contract.query("getAllConstituencies", (state,), None, Options::default(), None).await.unwrap();
        let constutiencies: Vec<String> = result.into_array().unwrap().into_iter().map(|token| token.into_string().unwrap()).collect();
        Ok(constutiencies)
    }


}