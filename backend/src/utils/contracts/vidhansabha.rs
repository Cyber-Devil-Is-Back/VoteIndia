use std::{thread::sleep, time::Duration};
use web3::{
    contract::{tokens::Detokenize, Contract, Error, Options},
    ethabi::{Address, Token},
    transports::Http,
    types::{H256, U256},
    Web3,
};

use super::{
    helper::{load_contract, Owner},
    structures::{ConstutiencyResult, District},
};

pub struct Vidhansabha {
    pub contract: Contract<Http>,
    pub web3: Web3<Http>,
    pub owner: Owner,
}
#[allow(dead_code)]
impl Vidhansabha {
    pub fn new(web3: Web3<Http>, contract_address: String) -> Vidhansabha {
        dotenv::dotenv().ok();
        let abi_path = std::env::var("VIDHANSABHA_CONTRACT_ABI")
            .expect("VIDHANSABHA_CONTRACT_ABI must be set");
        let contract = load_contract(contract_address, abi_path, web3.clone()).unwrap();

        Vidhansabha { contract, web3, owner: Owner::new(),
        }
    }

    pub async fn confirm_transaction(&self, tx_hash: H256) -> Result<(), Error> {
        for _ in 0..10 {
            if let Some(receipt) = self.web3.eth().transaction_receipt(tx_hash).await? {
                println!("Transaction confirmed in block: {:?}", receipt.block_number);
                return Ok(());
            }
            println!("Waiting for confirmation...");
            sleep(Duration::from_secs(15));
        }
        Err(Error::from("Transaction not confirmed".to_string()))
    }

    pub async fn register_candidate(&self, district: String,constituency: String,candidate_id: u128,) -> Result<(), Error> {
        let tx = self
            .contract
            .call(
                "registerCandidate",
                (district, constituency, candidate_id),
                self.owner.unlock().await.unwrap(),
                Options::default(),
            )
            .await?;
        self.confirm_transaction(tx).await
    }

    pub async fn vote(&self, district: String, constituency: String,   candidate_id: i64,address:Address) -> Result<(), Error> {
        let tx = self
            .contract
            .call(
                "vote",
                (district, constituency, U256::from(candidate_id)),
                address,
                Options::default(),
            )
            .await?;
        self.confirm_transaction(tx).await
    }

    pub async fn get_constituency_data(
        &self,
        district: String,
        constituency: String,
    ) -> Result<ConstutiencyResult, Error> {
        let result: Token = self
            .contract
            .query(
                "getConstituencyData",
                (district, constituency),
                self.owner.unlock().await.unwrap(),
                Options::default(),
                None,
            )
            .await?;

        let constituency_result = ConstutiencyResult::from_tokens(result.into_array().unwrap()).unwrap();
        Ok(constituency_result)
    }

    pub async fn get_district_data(&self, district: String) -> Result<District, Error> {
        let result: Token = self
            .contract
            .query("getDistrictData", (district,), self.owner.unlock().await.unwrap(), Options::default(), None)
            .await?;

        let district_result = District::from_tokens(result.into_array().unwrap()).unwrap();
        Ok(district_result)
    }

    pub async fn get_candidate_votes(
        &self,
        district: String,
        constituency: String,
        candidate_id: u128,
    ) -> Result<u128, Error> {
        let result: Token = self
            .contract
            .query(
                "getCandidateVotes",
                (district, constituency, candidate_id),
                self.owner.unlock().await.unwrap(),
                Options::default(),
                None,
            )
            .await?;

        let votes: u128 = result.into_uint().unwrap().as_u128();
        Ok(votes)
    }

    pub async fn get_candidate_ids(&self,district: String,constituency: String,) -> Result<Vec<u128>, web3::contract::Error> {
        println!("Fetching candidate IDs for district: {}, constituency: {}", district, constituency);
        println!("Contract address: {:?}", self.contract.address());
        println!("Contract ABI: {:?}", self.contract.abi());
        let result: Token = self
            .contract
            .query("getCandidateIds", (district, constituency), None, Options::default(), None)
            .await.unwrap();
        println!("{:?}",result);
        let tokens = result.into_array().ok_or_else(|| {
            Error::InvalidOutputType("Expected array of candidate IDs".to_string())
        }).unwrap();

        let ids: Vec<u128> = tokens
            .into_iter()
            .map(|token| token.into_uint().unwrap().as_u128())
            .collect();

        Ok(ids)
}

}


