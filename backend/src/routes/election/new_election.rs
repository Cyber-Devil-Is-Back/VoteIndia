
use std::time::{SystemTime, UNIX_EPOCH};
use actix_web::{get, post, web::{Data, Json}, HttpResponse, Responder};
use chrono::{Datelike, Utc};
use futures::StreamExt;
use mongodb::{bson::doc, Client};
use serde::{Deserialize, Serialize};
use serde_json::json;
use crate::routes::election::{create_election, Electiondata};
use super::ElectionType;


const DB_NAME: &str = "voteIndia";
const COLL_NAME:&str = "election";

#[derive(Serialize,Deserialize,Clone)]
struct Election{
    pub election_type:ElectionType,
    pub state:Option<String>
}
#[post("/deploy")]
pub async fn deploy_election(mongodb:Data<Client>,election: Json<Election>) -> impl Responder {
    let current_timestamp  = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .expect("Time went backwards")
    .as_secs() as i64; // Convert to milliseconds
    let state_clone = election.0.state.clone();
    let address = create_election(election.0.election_type.clone(), state_clone, current_timestamp).unwrap();
    let collection = mongodb.database(DB_NAME).collection::<Electiondata>(COLL_NAME);
    let now  = Utc::now();
    let future_date = now.with_year( now.year() + 5).expect("Filed to parsed date").signed_duration_since(now).num_seconds();
    let election_data = match election.0.election_type.clone() {
        ElectionType::LokSabha => Electiondata {
            address: address,
            etype: election.0.election_type,
            state: None,
            date: now.timestamp(),
            next_date: future_date ,
        },
        ElectionType::VidhanSabha => Electiondata {
            address: address,
            etype: election.0.election_type,
            state: election.0.state.clone(),
            date: now.timestamp(),
            next_date: future_date ,
        }
    } ;
    let result = collection.insert_one(election_data).await;
    match result {
        Ok(_) => {
           return  HttpResponse::Ok().json(json!({"message":"Election data inserted successfully"}));
        }
        Err(e) => {
            println!("Error inserting election data: {}", e);
            return  HttpResponse::InternalServerError().json(json!({"error": "Failed to insert election data"}));
        }
    }
}

#[derive(Serialize,Deserialize)]
struct ElectionTime{
    pub election_type:ElectionType,
    pub state:Option<String>
}
#[get("/timeLeft")]
pub async fn get_time_left(mongodb:Data<Client>,data:Json<ElectionTime>)-> impl Responder{
    let collection = mongodb.database(DB_NAME).collection::<Electiondata>(COLL_NAME);
    let filter = match data.0.election_type.clone() {
        ElectionType::LokSabha => doc! { "etype": "LokSabha" },
        ElectionType::VidhanSabha => doc! { "etype": "VidhanSabha", "state": data.state.clone() },
    };
    let mut election_data = collection.find(filter).sort(doc! { "date": -1 }).limit(1).await.unwrap();
    let data = election_data.next().await.unwrap().unwrap(); 

    HttpResponse::Ok().json(json!({"previous_time":data.date - data.next_date }))
}

#[post("/register_candidates")]
pub async fn register_candidates()-> impl Responder{
    HttpResponse::Ok().json("pewkvpek")
}

#[post("/election")]
pub async fn deploy()-> impl Responder{
    HttpResponse::Ok().json("pewkvpek")
}