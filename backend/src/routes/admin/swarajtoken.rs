use std::sync::Arc;

use actix_web::{ post, web::Data, HttpResponse, Responder};
use futures::StreamExt;
use mongodb::{bson::doc, Client, Collection};
use serde_json::json;
use web3::types::{H160, U256};

use crate::utils::{contracts::swarajtoken::SwarajToken,user::model::User};

const DB_NAME: &str = "voteIndia";
const COLL_NAME: &str = "users";

#[post("/mint")]
pub async fn fund_token(swaraj_token: Data<Arc<SwarajToken>>,client: Data<Client>) -> impl Responder{

    let collection: Collection<User> = client.database(DB_NAME).collection(COLL_NAME);

    match collection.count_documents(doc! {}).await {
        Ok(len) => {
            let amount: U256= U256::from(len); 
            swaraj_token.mint(amount).await.unwrap();
            HttpResponse::Ok().json(json!({"message":"Funded Token Successsfullf"}))
        },
        Err(err) => HttpResponse::InternalServerError().json(json!({"error": format!("Failed to count documents: {}", err)})),
    }
    
}

#[post("/disbursed")]
pub async fn disburse_fund(swaraj_token: Data<Arc<SwarajToken>>,client: Data<Client>) -> impl Responder{
    let collection: Collection<User> = client.database(DB_NAME).collection(COLL_NAME);
    match collection.find(doc!{}).await{
        Ok(cursor) => {
            let recipients: Vec<H160> = cursor.filter_map(|doc| async { doc.ok().map(|user| user.walletaddress.parse::<H160>().unwrap()) })
            .collect()
            .await;
            swaraj_token.batch_transfer(recipients).await.unwrap();
            HttpResponse::Ok().json(json!({"message":"Funded Token Successsfullf"}))

        }
        Err(err) => {
            HttpResponse::InternalServerError().json(json!({"error": format!("Failed to fetch data: {}", err)}))
        }

    }
}
