use std::{env, path::PathBuf};

use actix_multipart::form::MultipartForm;
use actix_web::{ get, post, put, web::{self, Data, Json}, HttpResponse, Responder};
use futures::StreamExt;
use mongodb::{bson::{doc, Bson}, Client};
use serde::Deserialize;
use serde_json::json;
use web3::{transports::Http, types::U256, Web3};
use crate::{routes::parties::forms::{ApprovedParty, PartyLogin, PartyStatus, Status}, utils::{common::password::{hash_password, verify_password}, contracts::party::PartyRegisterClient}};
use super::forms::{Party,PartyReturn,PartyType, PartyForm};

const DB_NAME: &str = "voteIndia";
const COLL_NAME: &str = "parties";
#[derive(Deserialize)]
struct Login{
    pub party_email: String,
    pub party_password: String,
}

#[post("login")]
pub async  fn login_party(client: Data<Client>, form: Json<Login>) -> impl Responder {
    let db = client.database(DB_NAME);
    let collection = db.collection::<PartyLogin>(COLL_NAME);
    let result = collection.find_one(doc! { "party_email": &form.party_email }).await;
    println!("this is result {:?}",result);
    match result {
        Ok(Some(party)) => {
            println!("password {}",form.0.party_password);
            if verify_password(&party.party_password,&form.party_password){
                if party.status == PartyStatus::Pending{
                    return HttpResponse::Ok().json(json!({"message":"Approval Pending","party_id":party._id,"status":"Pending"}));
                }
                else if party.status == PartyStatus::Rejected {
                    return HttpResponse::Ok().json(json!({"message":"Party is rejected"}));
                }
                else {
                    return HttpResponse::Ok().json(json!({"message":"Success","party_id":party._id,"party_type":party.party_type}));
                }
            } else {
                return HttpResponse::Unauthorized().json(json!({"message":"Invalid credentials"}));
            }
        }
        Ok(None) => return HttpResponse::Unauthorized().json(json!({"message":"Invalid credentials"})),
        Err(e) => return HttpResponse::InternalServerError().json(format!("Failed to fetch party: {}", e)),
    }
}
#[post("/register")]
pub async fn register_party(client: Data<Client>, mut form: MultipartForm<PartyForm>) -> impl Responder {
    let db = client.database(DB_NAME);
    let collection = db.collection::<Party>(COLL_NAME);

    // Check if the party name already exists
    let existing_party = collection
    .find_one(doc! {
        "$or": [
            { "name": form.0.party_name.clone() },
            { "party_abbreviation": form.0.party_abbreviation.clone()},
            { "party_email": form.0.party_email.clone() }
        ]
    })
    .await
    .unwrap_or(None);
    if existing_party.is_some() {
        return HttpResponse::BadRequest().json("A party with the same name, abbreviation, or email already exists");
    }

    // Validate the form data
    if form.party_name.is_empty()|| form.party_abbreviation.is_empty()|| form.party_slogan.is_empty()|| form.registration_date.is_empty()|| form.party_description.is_empty()
        || form.party_type.is_empty()|| form.party_email.is_empty()|| form.party_password.is_empty()|| form.party_website.is_empty()|| form.phone_number.is_empty()
        || form.party_leader.is_empty()|| form.party_founder.is_empty()|| form.party_manifesto.is_empty()
    {
        if form.0.party_type.parse::<PartyType>().map_err(|_| HttpResponse::BadRequest().json("Invalid party type")).unwrap() == PartyType::State && form.0.state.is_empty() {
            return HttpResponse::BadRequest().json("Invalid form data: All fields are required");
        }
        
        return HttpResponse::BadRequest().json("Invalid form data: All fields are required");
    }
    // Validate the file types and sizes
    let valid_extensions = ["png", "jpg", "jpeg"];
    let party_logo_file_name = form.0.party_logo.file_name.clone().unwrap_or_default();
    let logoextension = party_logo_file_name.split('.').last().unwrap_or_default();
    let leader_file_name = form.0.leader_image.file_name.clone().unwrap_or_default();
    let leaderextension = leader_file_name.split('.').last().unwrap_or_default();
    if !valid_extensions.contains(&logoextension) || !valid_extensions.contains(&leaderextension) {
        return HttpResponse::BadRequest().json("Invalid file type: Only PNG, JPG, and JPEG are allowed");
    }
    if form.0.party_logo.size > 5 * 1024 * 1024 || form.0.leader_image.size > 5 * 1024 * 1024 {
        return HttpResponse::BadRequest().json("File size exceeds the limit of 5MB");
    }
    let upload_dir = match env::var("UPLOAD_DIR") {
        Ok(dir) => dir,
        Err(_) => return HttpResponse::InternalServerError().json(json!({"message":"Some error occurred"})),
    };
    // Save the party logo and leader image to a directory
    let party_logo_path = PathBuf::from(&upload_dir).join(format!("party_logos/{}",format!("{}.{}",uuid::Uuid::new_v4(),logoextension)));
    let leader_image_path = PathBuf::from(&upload_dir).join(format!("leader_images/{}",format!("{}.{}",uuid::Uuid::new_v4(),leaderextension)));
    let mut party_logo_file = std::fs::File::create(&party_logo_path).unwrap();
    let mut leader_image_file = std::fs::File::create(&leader_image_path).unwrap();
    std::io::copy(&mut form.0.party_logo.file, &mut party_logo_file).unwrap();
    std::io::copy(&mut form.0.leader_image.file, &mut leader_image_file).unwrap();


    let last_party = collection
        .find_one(doc! {})
        .sort(doc! { "_id": -1 })
        .await
        .unwrap_or(None);
    let last_id = match last_party {
        Some(party) => party._id + 1,
        None => 1, // If no documents are found, start with ID 1
    };
    println!("this is last id {:?}",last_id);
    // Create a new Party instance 
    let state_party = Party {
        name: form.0.party_name.into_inner(), party_abbreviation: form.0.party_abbreviation.into_inner(), party_slogan: form.0.party_slogan.into_inner(),
        registration_on: form.0.registration_date.into_inner(), party_description: form.0.party_description.into_inner(), party_type: form.0.party_type.into_inner().parse::<PartyType>().map_err(|_| HttpResponse::BadRequest().json("Invalid party type")).unwrap(),
        party_email: form.0.party_email.into_inner(), party_password: hash_password(form.0.party_password.into_inner()), party_website: form.0.party_website.into_inner(),
        phone_number: form.0.phone_number.into_inner(), party_leader: form.0.party_leader.into_inner(), party_founder: form.0.party_founder.into_inner(),
        party_manifesto: form.0.party_manifesto.into_inner(),state: form.0.state.clone(),party_logo: party_logo_path.to_str().unwrap().to_string(),
        leader_image: leader_image_path.to_str().unwrap().to_string(), status: super::forms::PartyStatus::Pending, _id: last_id, 
    };
    let result = collection.insert_one(state_party).await;
    if let Err(e) = result {
        return HttpResponse::InternalServerError().json(format!("Failed to register state party: {}", e));
    }
  
    HttpResponse::Ok().json("State party registered successfully")
}
#[put("/update_status")]
pub async fn update_status(client:Data<Client>,web3:Data<Web3<Http>>,form:Json<Status>) ->  impl Responder {
    println!("this is form {:?}",form);
    let db = client.database(DB_NAME);
    let collection = db.collection::<Party>(COLL_NAME);
    let data = match collection.find_one(doc! { "_id": form.id as i64 }).await {
        Ok(data) => {
            if data.is_none() {
                return HttpResponse::NotFound().json("Party not found");
            }
            data.unwrap()
        },
        Err(e) => {
            return HttpResponse::InternalServerError().json(format!("Failed to fetch party: {}", e));
        }
    };
    if data.status == super::forms::PartyStatus::Approved {
        return HttpResponse::BadRequest().json("Party is already approved");
    }
    else if data.status == super::forms::PartyStatus::Pending {
        if form.status == PartyStatus::Rejected {
            let _ = collection.update_one(doc! { "id": form.id as i64 }, doc! { "$set": { "status": "Rejected" } }).await;
            return HttpResponse::Ok().json("Party status updated to rejected");
        }
        else if form.status == PartyStatus::Approved {
            let mut  partyregisterclient = PartyRegisterClient::new(web3.get_ref().clone());
            let _  = partyregisterclient.register_party(U256::from(data._id as u64),
                &data.name,&data.party_abbreviation,&data.party_slogan,&data.registration_on,&data.party_description,
                data.party_type as u8,&data.party_manifesto,&data.party_founder,&data.party_logo,&data.state
            ).await;
            let result = collection.update_one(doc! { "_id": form.id as i64 },
                doc! { "$set": { "status": "Approved" }, "$unset": {"name": "","party_abbreviation": "","party_slogan": "","registration_on": "", 
                "party_description": "","party_manifesto": "","party_logo": "", "state": "" 
                } }).await;
            match result {
                    Ok(update_result) => {
                        if update_result.matched_count == 0 {
                            return HttpResponse::NotFound().json("Party not found");
                        }
                        else {
                            return HttpResponse::Ok().json("Party status updated to approved");
                        }
                    }
                    Err(e) => {
                        return HttpResponse::InternalServerError().json(format!("Failed to update status: {}", e));
                    }
                }
        } else {
            return HttpResponse::BadRequest().json("Invalid status update request");
        }
    } else {
        return HttpResponse::BadRequest().json("Invalid party status");
    }
}


#[get("/get_by_name/{name}")]
pub async fn get_state_party_by_name(client:Data<Client>, web3:Data<Web3<Http>>, name: web::Path<String>) -> impl Responder {
   let partyregisterclient = PartyRegisterClient::new(web3.get_ref().clone());
    let party_data = partyregisterclient.get_party_by_name(name.into_inner().as_str()).await;
    match party_data {
        Ok(party_data) => {
            let db = client.database(DB_NAME);
            let collection = db.collection::<ApprovedParty>(COLL_NAME);
            let result = collection.find_one(doc! { "_id": Bson::from(party_data.id as i64) }).await.unwrap().unwrap();
            return HttpResponse::Ok().json(json!({
                "id": party_data.id,"name": party_data.name, "abbreviation": party_data.abbreviation, "slogan": party_data.slogan, "description": party_data.description, "party_type": party_data.party_type, "manifesto": party_data.manifesto, "logo": party_data.logo, "state": party_data.state,
                "registered_on": party_data.registered_on, "party_logo": party_data.logo, "party_founder": party_data.founder, "party_email": result.party_email, "party_website": result.party_website, "phone_number": result.phone_number, "party_leader": result.party_leader, "leader_image": result.leader_image,
            }));
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(format!("Failed to fetch state parties: {}", e));
        }
    }
}



#[get("/get_party_by_id/{id}")]
pub async fn get_state_party_by_id(web3: Data<Web3<Http>>, id: web::Path<i64>) -> impl Responder {
    let partyregisterclient = PartyRegisterClient::new(web3.get_ref().clone());
    let party_data = partyregisterclient.get_party_by_id(U256::from(*id)).await;
    match party_data {
        Ok(party_data) => {
            return HttpResponse::Ok().json(json!({ "id": party_data.id,"name": party_data.name, "party_type": party_data.party_type,"logo": party_data.logo, "state": party_data.state}));   
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(format!("Failed to fetch party data: {}", e));
        }
    }
}

#[get["get_by_state/{state}"]]
pub async fn get_party_by_state(web3: Data<Web3<Http>>, state: web::Path<String>) -> impl Responder {
    let mut partylist = Vec::new();
    let partyregisterclient = PartyRegisterClient::new(web3.get_ref().clone());
    match partyregisterclient.get_party_by_state(state.into_inner().as_str()).await {
        Ok(party_data) => {
            for i in 0..party_data.len() {
                partylist.push(json!({ "id": party_data[i].id, "name": party_data[i].name, "party_type": party_data[i].party_type, "party_logo": party_data[i].logo, "state": party_data[i].state }));
            }
            if partylist.is_empty() {
                return HttpResponse::NotFound().json("No parties found for the given state");
            } else {
                return HttpResponse::Ok().json(partylist);
            }
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(format!("Failed to fetch state parties: {}", e));
        }
    }
}
#[get("/get_natioanl_parties")]
pub async fn get_national_parties( web3: Data<Web3<Http>>) -> impl Responder {
    let mut partylist = Vec::new();
    let partyregisterclient = PartyRegisterClient::new(web3.get_ref().clone());
    match partyregisterclient.get_all_parties_by_type(0).await {
        Ok(party_data) => {
            for i in 0..party_data.len() {
                partylist.push(json!({ "id": party_data[i].id, "name": party_data[i].name, "party_type": party_data[i].party_type, "party_logo": party_data[i].logo }));
            }
            if partylist.is_empty() {
                return HttpResponse::NotFound().json("No parties found for the given state");
            } else {
                return HttpResponse::Ok().json(partylist);
            }
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(format!("Failed to fetch state parties: {}", e));
        }
    }
}
#[get("/get_state_parties")]
pub async fn get_state_parties(web3: Data<Web3<Http>>) -> impl Responder {
    let mut partylist = Vec::new();
    let partyregisterclient = PartyRegisterClient::new(web3.get_ref().clone());
    match partyregisterclient.get_all_parties_by_type(1).await {
        Ok(party_data) => {
            for i in 0..party_data.len() {
                partylist.push(json!({ "id": party_data[i].id, "name": party_data[i].name, "party_type": party_data[i].party_type, "party_logo": party_data[i].logo }));
            }
            if partylist.is_empty() {
                return HttpResponse::NotFound().json("No parties found for the given state");
            } else {
                return HttpResponse::Ok().json(partylist);
            }
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(format!("Failed to fetch state parties: {}", e));
        }
    }
}

#[get("/getAllNewPartys")]
pub async fn get_all_new_parties(client: Data<Client>) -> impl Responder {
    let db = client.database(DB_NAME);
    let collection = db.collection::<PartyReturn>(COLL_NAME);
    let filter = doc! { "status": "Pending" };
    let cursor = collection.find(filter).await;
    match cursor {
        Ok(mut cursor) => {
            let mut parties = Vec::new();
            while let Some(party) = cursor.next().await {
                match party {
                    Ok(party) => parties.push(party),
                    Err(e) => return HttpResponse::InternalServerError().json(format!("Failed to fetch stat e party: {}", e)),
                }
            }
            HttpResponse::Ok().json(parties)
        }
        Err(e) => HttpResponse::InternalServerError().json(format!("Failed to fetch state parties: {}", e)),
    }
}
