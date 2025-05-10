use std::{env, fs::File, path::PathBuf};

use actix_multipart::form::MultipartForm;
use actix_web::{get, put};
use actix_web::web::Json;
use actix_web::{post, web::Data, HttpResponse, Responder};
use futures::StreamExt;
use mongodb::bson::{doc, Bson};
use mongodb::{Client, Collection};
use serde_json::json;

use super::forms::{NationalCandidate, PartyStatus, Status};
use super::forms::RegisterNationalCandidate;



#[post("/national/register")]
pub async fn register_candidate(client: Data<Client>, mut form: MultipartForm<RegisterNationalCandidate>) -> impl Responder {
    let client  = client.database("voteIndia");
    let collection:Collection<NationalCandidate> = client.collection("national_candidates");
    if form.name.is_empty() || form.party_id.is_empty() || form.state.is_empty()|| form.constituency.is_empty() || form.0.image.file_name.is_none() {
        return HttpResponse::BadRequest().json("All fields are required")
    }
    let filename = form.0.image.file_name.clone().unwrap();
    let ext = filename.split('.').last().unwrap();
    if ext != "jpg" && ext != "png" && ext != "jpeg" {
        return HttpResponse::BadRequest().json("Image must be in jpg, png or jpeg format")
    }
    if form.0.image.size > 2 * 1024 * 1024 {
        return HttpResponse::BadRequest().json("Image size must be less than 2MB")
    }
    let upload_dir = match env::var("UPLOAD_DIR") {
        Ok(dir) => dir,
        Err(_) => return HttpResponse::InternalServerError().json(json!({"message":"Some error occurred"})),
    };
    // Save the party logo and leader image to a directory
    let img_path = PathBuf::from(&upload_dir).join(format!("Candidates/{}",format!("{}.{}",uuid::Uuid::new_v4(),ext)));
    let mut file = File::create(&img_path).unwrap();
    std::io::copy(&mut form.0.image.file, &mut file).unwrap();
    let candidate = NationalCandidate {
        party_id: form.0.party_id.clone(),
        name: form.0.name.clone(),
        gender: form.0.gender.clone(),
        image: img_path.to_str().unwrap().to_string(),
        dob: form.0.dob.clone(),
        state: form.0.state.clone(),
        constituency: form.constituency.clone(),
        status: PartyStatus::Pending,
    };
    let result = collection.insert_one(candidate).await;
    match result {
        Ok(_) => {
            println!("Candidate registered successfully");
        }
        Err(e) => {
            println!("Error registering candidate: {}", e);
            return HttpResponse::InternalServerError().json("Error registering candidate");
        }
    }
   HttpResponse::Ok().json("Candidate registered successfully")
}


#[put("/national/update_status/")]
pub async fn update_candidate_status(client: Data<Client>, data: Json<Status>) -> impl Responder {
    let client = client.database("voteIndia");
    let collection: Collection<NationalCandidate> = client.collection("state_candidates");
    let filter = doc! { "_id": Bson::Int64(data.id as i64) };
    let update = doc! { "$set": { "status": data.status.clone() } };
    let result = collection.update_one(filter, update).await;
    match result {
        Ok(_) => {
            println!("Candidate status updated successfully");
        }
        Err(e) => {
            println!("Error updating candidate status: {}", e);
            return HttpResponse::InternalServerError().json("Error updating candidate status");
        }
    }
   HttpResponse::Ok().json("Candidate status updated successfully")
}
#[get("/national/get_all_new")]
pub async fn get_all_new_candidates(client: Data<Client>) -> impl Responder {
    let client = client.database("voteIndia");
    let collection: Collection<NationalCandidate> = client.collection("state_candidates");
    let filter = doc! { "status": PartyStatus::Pending };
    let candidates = collection.find(filter).await;
    match candidates {
        Ok(mut cursor) => {
            let mut  candidates :Vec<NationalCandidate> = Vec::new();
            while let Some(candidate) = cursor.next().await {
                match candidate {
                    Ok(party) => candidates.push(party),
                    Err(e) => return HttpResponse::InternalServerError().json(format!("Failed to fetch state party: {}", e)),
                }
            }
            HttpResponse::Ok().json(candidates)
        }
        Err(e) => {
            println!("Error getting candidates: {}", e);
            return HttpResponse::InternalServerError().json("Error getting candidates");
        }
    }
}
#[get("/national/get_all")]
pub async fn get_all_candidates(client: Data<Client>) -> impl Responder {
    let client = client.database("voteIndia");
    let collection: Collection<NationalCandidate> = client.collection("national_candidates");
    let candidates = collection.find(doc! {}).await;
    match candidates {
        Ok(mut cursor) => {
            let mut  candidates :Vec<NationalCandidate> = Vec::new();
            while let Some(candidate) = cursor.next().await {
                match candidate {
                    Ok(party) => candidates.push(party),
                    Err(e) => return HttpResponse::InternalServerError().json(format!("Failed to fetch state party: {}", e)),
                }
            }
            HttpResponse::Ok().json(candidates)
        }
        Err(e) => {
            println!("Error getting candidates: {}", e);
            return HttpResponse::InternalServerError().json("Error getting candidates");
        }
    }
}