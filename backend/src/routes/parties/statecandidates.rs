use std::{env, fs::File, path::PathBuf};
use actix_multipart::form::MultipartForm;
use actix_web::{get, put};
use actix_web::web::Json;
use actix_web::{post, web::Data, HttpResponse, Responder};
use futures::StreamExt;
use mongodb::bson::{doc, Bson, Document};
use mongodb::options::FindOptions;
use mongodb::{Client, Collection};
use serde_json::json;
use super::forms::{StateCandidate, PartyStatus, Status};
use super::forms::RegisterStateCandidate;

#[post("/state/candidate/register")]
pub async fn register_candidate(client: Data<Client>, mut form: MultipartForm<RegisterStateCandidate>) -> impl Responder {
    println!("Form: {:?}", form.0);
    let database  = client.database("voteIndia");
    let collection:Collection<StateCandidate> = database.collection("state_candidates");
    if form.name.is_empty() || form.party_id.is_empty() || form.state.is_empty() || form.district.is_empty() || form.constituency.is_empty() || form.0.image.file_name.is_none() {
        return HttpResponse::BadRequest().json("All fields are required")
    }
    println!("check pass");
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
    println!("Upload dir: {:?}", upload_dir);
    // Save the party logo and leader image to a directory
    let img_path = PathBuf::from(&upload_dir).join(format!("Candidates/{}" ,format!("{}.{}",uuid::Uuid::new_v4(),ext)));
    let mut file = File::create(&img_path).unwrap();
    std::io::copy(&mut form.0.image.file, &mut file).unwrap();
     let find_options = FindOptions::builder()
        .sort(doc! { "id": -1 })
        .projection(doc! { "id": 1 })
        .limit(1)
        .build();
    let mut cursor = client.database("voteIndia").collection::<Document>("state_candidates").find(doc! {}).with_options(find_options).await.unwrap();
    println!("check pass 2");
    let last_id = match cursor.next().await {
        Some(Ok(doc)) => doc.get("id").and_then(|id| id.as_i64()).unwrap_or(0) + 1,
        _ => 1,
    };

    let candidate = StateCandidate {
        id: last_id ,
        party_id: form.0.party_id.clone(),
        name: form.0.name.clone(),
        gender: form.0.gender.clone(),
        image: img_path.to_str().unwrap().to_string(),
        dob: form.0.dob.clone(),
        state: form.0.state.clone(),
        district: form.district.clone(),
        constituency: form.constituency.clone(),
        status: PartyStatus::Pending,
    };
    let result = collection.insert_one(candidate).await;
    match result {
        Ok(_) => {
            return HttpResponse::Ok().json("Candidate registered successfully");
        }
        Err(e) => {
            println!("Error registering candidate: {}", e);
            return HttpResponse::InternalServerError().json("Error registering candidate");
        }
    }
}


#[put("/state/candidate/update_status/")]
pub async fn update_candidate_status(client: Data<Client>, data: Json<Status>) -> impl Responder {
    let client = client.database("voteIndia");
    let collection: Collection<StateCandidate> = client.collection("state_candidates");
    let  update :Document;
    let filter = doc! { "id": Bson::Int64(data.id as i64) };
    if data.status == PartyStatus::Rejected{
        update = doc! { "$set": { "status": PartyStatus::Rejected,"reason": data.reason.clone() } };
    } else {
        update = doc! { "$set": { "status": PartyStatus::Approved } };
    }
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

#[get("/state/candidate/get_all_new")]
pub async fn get_all_new_candidates(client: Data<Client>) -> impl Responder {
    let client = client.database("voteIndia");
    let collection: Collection<StateCandidate> = client.collection("state_candidates");
    let filter = doc! { "status": PartyStatus::Pending };
    let candidates = collection.find(filter).await;
    match candidates {
        Ok(mut cursor) => {
            let mut  candidates :Vec<StateCandidate> = Vec::new();
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

#[get("/state/candidate/get_all")]
pub async fn get_all_candidates(client: Data<Client>) -> impl Responder {
    let client = client.database("voteIndia");
    let collection: Collection<Document> = client.collection("state_candidates");
    let options = FindOptions::builder()
        .projection(doc! { "_id": 0 })
        .build();
    let candidates = collection.find(doc! {}).with_options(options).await;
    match candidates {
        Ok(mut cursor) => {
            let mut  candidates :Vec<Document> = Vec::new();
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