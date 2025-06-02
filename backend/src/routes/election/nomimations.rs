use std::collections::HashMap;

use actix_web::{get, post, web::{Data, Json}, HttpResponse, Responder};
use futures::StreamExt;
use mongodb::{bson::{doc, Bson, Document}, Client, Collection};
use serde::{Deserialize, Serialize};
use serde_json::json;
use web3::{transports::Http, Web3};

use crate::utils::contracts::{loksabha::LokSabha, vidhansabha::Vidhansabha};

#[derive(Debug, Deserialize, Serialize, Clone)]
struct Candidate {
    id: i64,
    name: String,
    image: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct EnrichedNomination {
    election_type: String,
    constituency: String,
    candidateid: i64,
    location: String, // district or state
    candidate_name: String,
    candidate_image: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(untagged)]
enum Nomination {
    State {
        district: String,
        constituency: String,
        candidateid: i64,
    },
    National {
        state: String,
        constituency: String,
        candidateid: i64,
    },
}

#[derive(Debug, Deserialize)]
struct NominationPayload {
    #[serde(rename = "type")]
    election_type: String, // "state" or "national"
    nominations: Vec<Nomination>,
}

#[post("/submit-nominations")]
pub async fn submit_nominations(
    mongodb: Data<Client>,
    payload: Json<NominationPayload>,
) -> impl Responder {
    let collection: Collection<Document> = mongodb
        .database("voteIndia")
        .collection("nominations");

    // Validate election_type
    let invalid_type = match payload.election_type.as_str() {
        "state" => payload.nominations.iter().any(|n| matches!(n, Nomination::National { .. })),
        "national" => payload.nominations.iter().any(|n| matches!(n, Nomination::State { .. })),
        _ => return HttpResponse::BadRequest().body("Invalid election type: must be 'state' or 'national'"),
    };

    if invalid_type {
        return HttpResponse::BadRequest().body("Nomination entries do not match the specified election type");
    }

    // Convert nominations to BSON
    let docs: Vec<Document> = payload
        .nominations
        .iter()
        .map(|nom| mongodb::bson::to_document(nom).unwrap())
        .collect();

    match collection.insert_many(docs).await {
        Ok(result) => HttpResponse::Ok().json(serde_json::json!({
            "status": "success",
            "inserted_count": result.inserted_ids.len()
        })),
        Err(err) => {
            eprintln!("MongoDB insert error: {:?}", err);
            HttpResponse::InternalServerError().body("Failed to insert nominations")
        }
    }
}

#[get("/get-nominations")]
pub async fn get_nominations(mongodb: Data<Client>) -> impl Responder {
    let db = mongodb.database("voteIndia");
    let nominations_collection = db.collection::<Document>("nominations");

    // Fetch nominations
    let cursor = match nominations_collection.find(doc! { "status": { "$ne": "Approved" }}).await {
        Ok(cursor) => cursor,
        Err(err) => {
            eprintln!("MongoDB error fetching nominations: {:?}", err);
            return HttpResponse::InternalServerError().body("Failed to fetch nominations");
        }
    };
    let docs: Vec<Document> = cursor.filter_map(|res| async { res.ok() }).collect().await;
    if docs.is_empty() {
        return HttpResponse::Ok().json(Vec::<EnrichedNomination>::new());
    }

    let is_state = docs.first().and_then(|d| d.get("district")).is_some();
    let table_name = if is_state { "state_candidates" } else { "national_candidates" };
    let candidates_collection = db.collection::<Candidate>(table_name);

    // Extract candidate IDs
    let candidate_ids: Vec<i64> = docs.iter().filter_map(|doc| {
        match doc.get("candidateid") {
            Some(Bson::Int64(id)) => Some(*id),
            Some(Bson::Int32(id)) => Some(*id as i64),
            _ => None,
        }
    }).collect();

    // Fetch candidates
    let mut candidate_cursor = match candidates_collection.find(doc! { "id": { "$in": &candidate_ids } }).await {
        Ok(cursor) => cursor,
        Err(err) => {
            eprintln!("MongoDB error fetching candidates: {:?}", err);
            return HttpResponse::InternalServerError().body("Failed to fetch candidates");
        }
    };

    // Build lookup table for nominations by candidate ID
    let nomination_map: HashMap<i64, &Document> = docs.iter().filter_map(|doc| {
        let id = match doc.get("candidateid") {
            Some(Bson::Int64(i)) => Some(*i),
            _ => None,
        };
        id.map(|i| (i, doc))
    }).collect();

    // Compose enriched nominations
    let mut enriched = Vec::with_capacity(nomination_map.len());

    while let Some(Ok(candidate)) = candidate_cursor.next().await {
        if let Some(nomination) = nomination_map.get(&candidate.id) {
            let election_type = if nomination.get("district").is_some() { "state" } else { "national" };
            let constituency = nomination.get_str("constituency").unwrap_or_default();
            let location = match election_type {
                "state" => nomination.get_str("district").unwrap_or_default(),
                _ => nomination.get_str("state").unwrap_or_default(),
            };

            enriched.push(EnrichedNomination {
                election_type: election_type.to_string(),
                constituency: constituency.to_string(),
                candidateid: candidate.id,
                location: location.to_string(),
                candidate_name: candidate.name.clone(),
                candidate_image: candidate.image.clone(),
            });
        }
    }

    HttpResponse::Ok().json(enriched)
}


#[post("/finalize-nomination")]
pub async fn finalize_nominations(mongodb:Data<Client>,web3:Data<Web3<Http>>,data:Json<EnrichedNomination>) -> impl Responder {
    let coll : Collection<Document> = mongodb.database("voteIndia").collection("election");
    let address = coll.find_one(doc! {}).sort(doc!{ "date": -1 }).await.unwrap().unwrap().get_str("address").unwrap().to_string();
    println!("{:?}",address);
    if data.election_type == "state"{
        let contract  =  Vidhansabha::new(web3.get_ref().clone(), address);
        match contract.register_candidate(data.0.location, data.0.constituency, data.0.candidateid as u128).await {
            Ok(_) => {
                let coll = mongodb.database("voteIndia").collection::<Document>("nominations");
                let res = coll.update_one(doc! {"candidateid":data.0.candidateid}, doc! {"$set":{"status":"Approved"}}).await.unwrap();
                println!("Updated nominations: {:?}", res);
                return HttpResponse::Ok().json(json!({"message":"Candidate registered successfully"}))
            },
            Err(e) => { 
                eprintln!("Error registering candidate: {:?}", e);
                return HttpResponse::InternalServerError().json(json!({"message":"Failed to register candidate"}));
            }
        }
    }
    else if data.election_type == "national" {
        let contract  =  LokSabha::new(web3.get_ref().clone(), address);
        match contract.register_candidate(data.0.location, data.0.constituency, data.0.candidateid as u128).await {
            Ok(_) => return HttpResponse::Ok().json(json!({"message":"Candidate registered successfully"})),
            Err(e) => {
                eprintln!("Error registering candidate: {:?}", e);
                return HttpResponse::InternalServerError().json(json!({"message":"Failed to register candidate"}));
            }
        }
    }
    HttpResponse::BadRequest().json(json!({"message":"Invalid election type"}))
}