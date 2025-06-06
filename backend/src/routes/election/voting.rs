use actix_web::{get, post, web::{Data, Json, Path}, HttpResponse, Responder};
use mongodb::{
    bson::{doc, Bson},
    Client, Collection,
};
use serde_json::json;
use web3::{ethabi::Address, transports::Http, types::U256, Web3};
use futures::stream::StreamExt;

use crate::utils::{contracts::{ party::PartyClient, structures::District, swarajtoken::SwarajToken, vidhansabha::Vidhansabha}, user::generate_account::unlock_account};

#[derive(Debug, PartialEq, serde::Serialize, serde::Deserialize, Clone)]
struct Location {
    pub district: String,
    pub state: String,
    pub constituency: String,
}

#[derive(Debug, PartialEq, serde::Serialize, serde::Deserialize, Clone)]
struct Election {
    pub etype: String,
    pub address: String,
    pub state: String,
}

#[derive(Debug, PartialEq, serde::Serialize, serde::Deserialize, Clone)]
struct Candidate {
    pub id: i64,
    pub name: String,
    pub party_id: i64, // Still string in DB
    pub image: String,
}

#[derive(Debug, PartialEq, serde::Serialize, serde::Deserialize, Clone)]
struct Party {
    pub id: i32,
    pub name: String,
    pub symbol: String,
}

#[derive(Debug, PartialEq, serde::Serialize, serde::Deserialize, Clone)]
struct Result {
    pub id: i64,
    pub name: String,
    pub image: String,
    pub party_name: String,
    pub party_symbol: String,
}

#[post("/get-candidates")]
pub async fn get_candidates(mongodb: Data<Client>,web3: Data<Web3<Http>>,data: Json<Location>,) -> impl Responder {
    println!("i have beeen called ");
    let db = mongodb.database("voteIndia");
    let coll: Collection<Election> = db.collection("election");
    
    // 1. Get latest election (assumes one document for now)
    let result = coll.find_one(doc! {}).sort(doc!{ "date": -1 }).await.unwrap().unwrap();
    println!("{:?}",result);

    if result.etype == "VidhanSabha" {
        // 2. Call contract to get candidate IDs
        println!("under vidhan sabha");
        let contract = Vidhansabha::new(web3.get_ref().clone(), result.address);
        let candidate_ids = match contract
            .get_candidate_ids(data.district.clone(), data.constituency.clone())
            .await
        {
            Ok(ids) => ids,
            Err(_) => return HttpResponse::InternalServerError().body("Error fetching from contract"),
        };
        println!("{:?}",candidate_ids);
        // 3. Fetch candidates in one DB call
        let candidate_coll: Collection<Candidate> = db.collection("state_candidates");
        let ids_bson: Vec<Bson> = candidate_ids.iter().map(|id| Bson::Int64(*id as i64)).collect();
        println!("i have done till here");
        let mut cursor = match candidate_coll.find(doc! { "id": { "$in": &ids_bson } }).await {
            Ok(cursor) => cursor,
            Err(_) => return HttpResponse::InternalServerError().body("Failed to query candidates"),
        };
        println!(" 2 till here");

        let mut candidates: Vec<Result> = Vec::new();
        while let Some(result) = cursor.next().await {
            println!("{:?}",result);
            match result {
                Ok(candidate) => {
                    let party = PartyClient::new(web3.get_ref().clone()).get_party_by_id(U256::from(candidate.party_id)).await.unwrap();
                    
                    candidates.push(Result{
                        id:candidate.id,
                        name: candidate.name,
                        image: candidate.image,
                        party_name: party.name,
                        party_symbol: party.logo,
                    });


                },
                Err(e) => eprintln!("Error fetching candidate: {:?}", e),
            }
        }

        // 4. Extract unique party IDs as integers
        return HttpResponse::Ok().json(json!({"candidates":candidates}));
   
    }

    // Future: add LokSabha handling here
    HttpResponse::Ok().body("Get Candidates (LokSabha not implemented)")
}

#[derive(Debug, PartialEq, serde::Serialize, serde::Deserialize, Clone)]
struct User{
    pub id: i64,
    pub username: String,
    pub state: String,
    pub walletaddress: String,
    pub image: String,
    pub email: String,
}

#[get("/voters")]
pub async fn get_voters(mongodb:Data<Client>) -> impl Responder{
    let collection: Collection<Election>  = mongodb.database("voteIndia").collection("election");
    let result = collection.find_one(doc! {}).sort(doc!{ "date": -1 }).await.unwrap().unwrap();
    if result.etype == "VidhanSabha" {
        println!("{:?}",result);
        let coll = mongodb.database("voteIndia").collection::<User>("users");
        let mut cursor = match coll.find(doc! {"state":result.state}).await {
            Ok(cursor) => cursor,
            Err(_) => return HttpResponse::InternalServerError().json(json!({"message":"Failed to query voters"})),
        };
        let mut voters: Vec<User> = Vec::new();
        while let Some(result) = cursor.next().await {
            match result {
                Ok(user) => {
                    println!("{:?}",user);
                    voters.push(User {
                        id: user.id,
                        username: user.username,
                        state: user.state,
                        walletaddress: user.walletaddress,
                        image: user.image,
                        email: user.email,
                    });
                },
                Err(e) => eprintln!("Error fetching voter: {:?}", e),
            }
        }
        return HttpResponse::Ok().json(json!({"voters": voters}));
    }

    HttpResponse::Ok().body("Get Voters")
}

#[derive(Debug, PartialEq, serde::Serialize, serde::Deserialize, Clone)]
pub struct FundToken {
    pub addresses: Vec<String>,
}
#[post("/fund-token")]
pub async fn fund_token(web3: Data<Web3<Http>>, data: Json<FundToken>) -> impl Responder {
    let recipients: Vec<Address>  = data.addresses.iter()
        .filter_map(|addr| addr.parse::<Address>().ok())
        .collect();
    if recipients.is_empty() {
        return HttpResponse::BadRequest().json(json!({"message": "Invalid addresses provided"}));
    }   
    else {
        println!("Funding {} recipients", recipients.len());
        let contract = SwarajToken::new(web3.get_ref().clone());
        match contract.mint(U256::from(recipients.len())).await {
            Ok(_) => println!("Minted tokens successfully"),
            Err(e) => {
                eprintln!("Error minting tokens: {:?}", e);
                return HttpResponse::InternalServerError().json(json!({"message": "Failed to mint tokens"}));
            }
        }
        match contract.deposit_gas_funds(recipients.len() as i64).await {
            Ok(_) => println!("Deposited gas funds successfully"),
            Err(e) => {
                eprintln!("Error depositing gas funds: {:?}", e);
                return HttpResponse::InternalServerError().json(json!({"message": "Failed to deposit gas funds"}));
            }
        }
        match contract.batch_transfer(recipients).await {
            Ok(_) => return HttpResponse::Ok().json(json!({"message": "Tokens funded successfully"})),
            Err(e) => {
                eprintln!("Error funding tokens: {:?}", e);
                return HttpResponse::InternalServerError().json(json!({"message": "Failed to fund tokens"}));   
            }
        }
    }
}

#[derive(Debug, PartialEq, serde::Serialize, serde::Deserialize, Clone)]
struct Vote{
    pub user_walletaddress: String,
    pub candidate_id: i64,
    pub district: String,
    pub constituency: String,
}
#[post("/vote")]
pub async fn vote(web3: Data<Web3<Http>>,mongodb:Data<Client>, data: Json<Vote>) -> impl Responder {

    let collection = mongodb.database("voteIndia").collection::<Election>("election");
    let result = collection.find_one(doc! {}).sort(doc!{ "date": -1 }).await.unwrap().unwrap();
    println!("{:?}",result);
    if result.etype == "VidhanSabha" {
        let contract = Vidhansabha::new(web3.get_ref().clone(),result.address.clone() );
        let swaraj_token = SwarajToken::new(web3.get_ref().clone());
        let user_wallet:Address = match data.user_walletaddress.to_string().parse::<Address>() {
            Ok(addr) => addr,
            Err(_) => return HttpResponse::BadRequest().json(json!({"message": "Invalid wallet address format"})),
        };
        println!("User wallet address: {:?}", user_wallet);
        let contract_address = match result.address.parse::<Address>() {
            Ok(addr) => addr,
            Err(_) => return HttpResponse::BadRequest().json(json!({"message": "Invalid contract address format"})),
        };
        unlock_account(user_wallet).await.unwrap();
        swaraj_token.approve_contarct(contract_address, U256::from(1), user_wallet).await.unwrap();
        // Ensure the arguments match the contract's vote method signature
        match contract.vote(
            data.district.clone(),
            data.constituency.clone(),
            data.candidate_id ,
            user_wallet,
        ).await {
            Ok(_) => println!("Vote cast successfully"),
            Err(e) => {
                eprintln!("Error casting vote: {:?}", e);
                return HttpResponse::InternalServerError().json(json!({"message": "Failed to cast vote"}));
            }
        }
        HttpResponse::Ok().body("Vote cast successfully")
    }
    else {
        HttpResponse::BadRequest().json(json!({"message": "Voting is only available for Vidhan Sabha elections"}))
    }
}
#[get("get-balance/{address}")]
pub async fn get_balance(web3: Data<Web3<Http>>, address: Path<String>) -> impl Responder {
    let address = match address.parse::<Address>() {
        Ok(addr) => addr,
        Err(_) => return HttpResponse::BadRequest().json(json!({"message": "Invalid address format"})),
    };  

    let contract = SwarajToken::new(web3.get_ref().clone());
    match contract.balance_of(address).await {
        Ok(balance) => HttpResponse::Ok().json(json!({"balance": balance})),
        Err(e) => {
            eprintln!("Error fetching balance: {:?}", e);
            HttpResponse::InternalServerError().json(json!({"message": "Failed to fetch balance"}))
        }
    }
}
#[derive(Debug, PartialEq, serde::Serialize, serde::Deserialize, Clone)]
struct States{
    pub districts: Vec<String>,
}

#[get("/results")]
pub async fn get_results(web3: Data<Web3<Http>>,mongodb:Data<Client>) -> impl Responder {
    let collection = mongodb.database("voteIndia").collection::<Election>("election");
    let result = collection.find_one(doc! {}).sort(doc!{ "date": -1 }).await.unwrap().unwrap();
    if result.etype == "VidhanSabha" {
        let coll = mongodb.database("voteIndia").collection::<States>("stateConstituency");
        let pipeline = vec![
                doc! { "$match": { "state": result.state } },
                doc! { "$project": {
                    "_id": 0,
                    "districts": {
                        "$map": {
                            "input": "$districts",
                            "as": "d",
                            "in": "$$d.district"
                        }
                    }
                }}
            ];

        let states_data =  coll.aggregate(pipeline).await.unwrap().next().await.unwrap().unwrap(); 
        let contract = Vidhansabha::new(web3.get_ref().clone(),result.address.clone() );
        let mut data:Vec<District> = Vec::new();
        for district in states_data.get_array("districts").unwrap() {
            let constituency_data = match contract.get_district_data(district.to_string()).await {
                Ok(data) => data,
                Err(_) => return HttpResponse::InternalServerError().json(json!({"message": "Failed to fetch constituency data"})),
            };
            println!("{:?}",constituency_data);
            data.push(District {
                name: district.to_string(),
                constutiencies: constituency_data.constutiencies,
            });
           
        }

       
        return HttpResponse::Ok().json(json!({"results": data}));
    }
    HttpResponse::BadRequest().json(json!({"message": "Results are only available for Vidhan Sabha elections"}))
}