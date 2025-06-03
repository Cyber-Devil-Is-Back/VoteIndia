use actix_web::{get, post, web::{Data, Json}, HttpResponse, Responder};
use mongodb::{
    bson::{doc, Bson},
    Client, Collection,
};
use web3::{transports::Http, Web3};
use futures_util::stream::StreamExt;
use std::collections::{HashMap, HashSet};

use crate::utils::contracts::{loksabha::LokSabha, vidhansabha::Vidhansabha};

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

        let mut candidates: Vec<Candidate> = Vec::new();
        while let Some(result) = cursor.next().await {
            println!("{:?}",result);
            match result {
                Ok(candidate) => candidates.push(candidate),
                Err(e) => eprintln!("Error fetching candidate: {:?}", e),
            }
        }

        // 4. Extract unique party IDs as integers
        let unique_party_ids: Vec<i64> = candidates
            .iter()
            .map(|c| c.party_id)
            .collect::<HashSet<_>>()
            .into_iter()
            .collect();

        // 5. Fetch all parties in one DB call
        let party_coll: Collection<Party> = db.collection("parties");
        let mut parties_cursor = match party_coll
            .find(doc! { "id": { "$in": unique_party_ids.clone() } })
            .await
        {
            Ok(cursor) => cursor,
            Err(_) => return HttpResponse::InternalServerError().body("Failed to query parties"),
        };

        let mut party_map: HashMap<i64, Party> = HashMap::new();
        while let Some(result) = parties_cursor.next().await {
            match result {
                Ok(party) => {
                    party_map.insert(party.id.into(), party);
                }
                Err(e) => eprintln!("Error fetching party: {:?}", e),
            }
        }

        // 6. Construct response
        let candidates_list: Vec<Result> = candidates
            .into_iter()
            .map(|c| {
                let pid = c.party_id;
                let party = party_map.get(&pid);
                Result {
                    id: c.id,
                    name: c.name,
                    image: c.image,
                    party_name: party.map_or(c.party_id.to_string(), |p| p.name.clone()),
                    party_symbol: party.map_or(String::new(), |p| p.symbol.clone()),
                }
            })
            .collect();
            println!("{:?}",candidates_list);
        return HttpResponse::Ok().json(candidates_list);

    }

    // Future: add LokSabha handling here
    HttpResponse::Ok().body("Get Candidates (LokSabha not implemented)")
}
