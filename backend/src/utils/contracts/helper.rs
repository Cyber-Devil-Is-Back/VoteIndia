use std::str::FromStr;
use std::{ fs::File, io::{Cursor, Error, Read}, path::Path};
use ipfs_api_backend_actix::{IpfsApi, IpfsClient};
use web3::signing::SecretKey;
use web3::{contract::Contract, transports::Http, types::Address, Web3};



pub struct Owner{
    pub address : Address,
    pub pkey : SecretKey,
}


impl  Owner {
    pub fn new () -> Owner{
        dotenv::dotenv().ok();
        let _address :Address = std::env::var("WALLET_ADDRESS").expect("Specify WALLET_ADDRESS in .env file").parse().unwrap();
        let _pkey = std::env::var("PRIVATE_KEY").expect("PRIVATE_KEY must be set");

        Owner{address: _address,
             pkey: SecretKey::from_str(&_pkey).unwrap()}

    }

    pub async fn unlock(&self) -> Result<Address, web3::Error>{
        let password = std::env::var("OWNER_PASSWORD").expect("Specify OWNER_PASSWORD in .env file");
        let rpc_url = std::env::var("RPC_URL").expect("RPC_URL must be set");

        let web3 = Web3::new(Http::new(&rpc_url).unwrap());
        let personal = web3.personal();
        personal.unlock_account(self.address, &password, Some(300)).await.unwrap();
        return Ok(self.address);
    }
}

pub fn load_contract(contract_address: String,contract_abi_path: String, web3: Web3<Http>) -> Result<Contract<Http>, Box<dyn std::error::Error>> {
    let address = Address::from_str(&contract_address)
        .map_err(|e| format!("Invalid contract address: {}", e))?;
    let mut file = File::open(&contract_abi_path)
        .map_err(|e| format!("Failed to open ABI file '{}': {}", contract_abi_path, e))?;
    let mut abi_bytes = Vec::new();
    file.read_to_end(&mut abi_bytes)
        .map_err(|e| format!("Failed to read ABI file: {}", e))?;
    let contract = Contract::from_json(web3.eth(), address, abi_bytes.as_slice())
        .map_err(|e| format!("Failed to load contract from ABI: {}", e))?;

    Ok(contract)
}

pub fn load_key() -> SecretKey{
    let _pkey = std::env::var("PRIVATE_KEY").expect("PRIVATE_KEY must be set");
    SecretKey::from_str(&_pkey).unwrap()
}

pub async fn upload(path: &Path) -> Result<String, Error> {
       
    let client = IpfsClient::default(); 
    match File::open(path){
        Ok(mut file) => {
            let mut buffer = Vec::new();
                file.read_to_end(&mut buffer)?;
                let cursor = Cursor::new(buffer);
                match client.add(cursor).await{
                    Ok(response) => {
                        Ok(response.hash)
                    },
                    Err(e) => {
                        Err(std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))
                    }
                }
        },
        Err(e) => return Err(e)
        
    }
}