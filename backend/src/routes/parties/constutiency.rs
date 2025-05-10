use actix_web::{get, web::{Data, Query}, HttpResponse, Responder};
use futures::StreamExt;
use mongodb::{
    bson::{doc, Bson, Document},
    Client,
};
use serde::Deserialize;

const DB_NAME: &str = "voteIndia";

#[derive(Debug, Deserialize)]
pub struct StateQuery {
    state: String,
}

#[get("/districts/")]
pub async fn get_districts(client: Data<Client>,query: Query<StateQuery>,) -> impl Responder {
    let db = client.database(DB_NAME);
    let collection = db.collection::<Document>("stateConstituency");
    let pipeline = vec![doc! { "$match": { "state": &query.state } }, doc! { "$unwind": "$districts" },doc! {
            "$project": {"_id": 0,"district": "$districts.district","constituencies": "$districts.constituencies"}
        },
        doc! {
            "$group": {
                "_id": Bson::Null,
                "result": {
                    "$push": {
                        "k": "$district",
                        "v": "$constituencies"
                    }
                }
            }
        },
        doc! {
            "$replaceRoot": {
                "newRoot": { "$arrayToObject": "$result" }
            }
        },
    ];

    let mut cursor = match collection.aggregate(pipeline).await {
        Ok(cursor) => cursor,
        Err(e) => {
            eprintln!("Aggregation error: {:?}", e);
            return HttpResponse::InternalServerError().body("Failed to aggregate data");
        }
    };
    if let Some(Ok(doc)) = cursor.next().await {
        HttpResponse::Ok().json(doc)
    } else {
        HttpResponse::NotFound().body("State not found or no data")
    }
}
#[get("/states-uts")]
pub async fn get_state(client: Data<Client>) -> impl Responder {
    let db = client.database(DB_NAME);
    let collection = db.collection::<Document>("stateConstituency");
    let pipeline = vec![doc! { "$group": { "_id": "$state" } }];

    let mut cursor = match collection.aggregate(pipeline).await {
        Ok(cursor) => cursor,
        Err(e) => {
            eprintln!("Aggregation error: {:?}", e);
            return HttpResponse::InternalServerError().body("Failed to aggregate data");
        }
    };
    let mut states = Vec::new();
    while let Some(Ok(doc)) = cursor.next().await {
        if let Some(Bson::String(state)) = doc.get("_id") {
            states.push(state.clone());
        }
    }
    HttpResponse::Ok().json(states)
}

#[get["national/Constituency"]]