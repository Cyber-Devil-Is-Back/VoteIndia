use web3::transports::Http;
use web3::types::Address;
use web3::Web3;


use std::{env, io};
pub async fn create_account() -> Result<String,io::Error>{

    dotenv::dotenv().ok(); // Load environment variables from .env

    let url = env::var("RPC_URL").unwrap();
    let transport = Http::new(&url).unwrap();
    let web3 = Web3::new(transport);

    let password = env::var("WALLET_PASSWORD").unwrap();
    
    let address: Address = web3.personal().new_account(&password).await.unwrap();
    
    Ok(hex::encode(address.as_bytes()))
}