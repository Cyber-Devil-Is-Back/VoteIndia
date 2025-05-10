use std::{env, fs, path::PathBuf};

use actix_multipart::form::MultipartForm;
use actix_web::{cookie::{time::Duration, Cookie, SameSite}, delete, get, post, put, web::{Data, Json, Query}, HttpResponse, Responder};
use futures::TryStreamExt;
use mongodb::{bson::doc, Client, Collection};
use serde_json::{json, Value};
use uuid::Uuid;
use crate::utils::common::jwt::generate_token;
use crate::utils::common::password::{hash_password, verify_password};
use crate::utils::admin::models::Admin;
use super::forms::{AdminLoginForm, RegisterAdmin,UpdateAdmin};


const DB_NAME: &str = "voteIndia";
const COLL_NAME: &str = "admin";
const MAX_FILE_SIZE: usize = 10 * 1024 * 1024; // 10 MB max file size

fn message(msg: &str) -> Value {
    json!({ "message": msg })
}


#[post("/login")]
pub async  fn login(client: Data<Client>, form: Json<AdminLoginForm>) -> impl Responder{
    let collection:Collection<Admin> = client.database(DB_NAME).collection(COLL_NAME);
    match collection.find_one(doc! { "email": &form.email.clone() }).await {
        Ok(Some(admin)) => {
            // Verify the password
            if verify_password(&admin.password,&form.password ) {
                let auth = generate_token(admin.id.clone()).unwrap();
                let cookie= Cookie::build("auth_token", auth)
                                                .max_age(Duration::minutes(30))
                                                .http_only(true)
                                                .secure(true)
                                                .path("/")
                                                .same_site(SameSite::None)
                                                .finish();
                HttpResponse::Ok().cookie(cookie).json(json!({"message": "Login successful"}))
            } else {
                HttpResponse::Unauthorized().json(json!({"message": "Invalid credentials"}))
            }
        }
        Ok(None) => HttpResponse::NotFound().json(json!({"message": "Invalid credentials"})),
        Err(err) => HttpResponse::InternalServerError().json(json!({"message": err.to_string()}))
    }
}

#[post("/register")]
pub async fn register(client: Data<Client>, form: MultipartForm<RegisterAdmin>) -> impl Responder {

    dotenv::dotenv().ok();
    let collection: Collection<Admin> = client.database(DB_NAME).collection(COLL_NAME);

    if collection.find_one(doc! { "username": &form.username.0 }).await.unwrap().is_some() ||
    collection.find_one(doc! { "email": &form.email.0 }).await.unwrap().is_some() {
     return HttpResponse::Conflict().json(message("Username or Email already exists"));
    }
    let password = hash_password(form.password.0.clone());
    let file_extension = match &form.image.file_name {
        Some(file_name) => match file_name.rsplit('.').next() {
            Some(ext) => ext,
            None => "unknown", // If no extension is found
        },
        None => "unknown", // If no file name is provided
    };
    let valid_extensions = ["png", "jpg", "jpeg"];
    
    if !valid_extensions.contains(&file_extension)  {
        return HttpResponse::BadRequest().json(message("Invalid file type"));
    }
    else if form.image.size > MAX_FILE_SIZE{
        return HttpResponse::BadRequest().json(message("To big File size"));
    }
    let upload_dir = match env::var("UPLOAD_DIR") {
                Ok(dir) => dir,
                Err(_) => return HttpResponse::InternalServerError().json(message("Some error occurred")),
            };

    let file_name = format!("{}.{}", Uuid::new_v4(), file_extension);
    let mut path = PathBuf::from(upload_dir);
    path.push("admin");
    path.push(&file_name);
    println!("{:?}",path);
    if let Err(_) = fs::copy(form.image.file.path(), &path) {
        return HttpResponse::InternalServerError().json(message("Unable to save image"));
    }
    let admin = Admin{
        id:form.id.0.clone(),
        username:form.username.0.clone(),
        password:password,
        image:path.to_str().unwrap().to_string(),
        email:form.email.0.clone(),
        is_admin:form.isadmin.0.clone()
    };
    match collection.insert_one(admin).await {
        Ok(_) => HttpResponse::Created().json(json!({"message": "User registered successfully"})),
        Err(err) => {
            eprintln!("{}",err);
            HttpResponse::InternalServerError().json(message("unable to register user"))},
    }
}


#[put("/update")]
pub async fn update(client: Data<Client>, form: MultipartForm<UpdateAdmin>) -> impl Responder {
    let collection: Collection<Admin> = client.database("voteIndia").collection("admin");

    println!("{:?}",form.id);
    println!("this is file : {:?}",form.0.image);

    let mut update_doc = doc! {};

    if let Some(username) = &form.username {
        update_doc.insert("username", &username.0);
    }
    if let Some(password) = &form.password {
        update_doc.insert("password", hash_password(password.0.clone()));
    }
    if let Some(email) = &form.email {
        update_doc.insert("email", &email.0);
    }
    if let Some(isadmin) = &form.isadmin {
        update_doc.insert("is_admin", isadmin.0);
    }
    
    // Handle file upload if provided
    if let Some(image) = &form.image {
        let file_extension = image.file_name.as_deref().and_then(|name| name.rsplit('.').next()).unwrap_or("unknown");
        let valid_extensions = ["png", "jpg", "jpeg"];

        
        if !valid_extensions.contains(&file_extension) {
            return HttpResponse::BadRequest().json(json!({"message": "Invalid file type"}));
        }
        if image.size > 10 * 1024 * 1024 {
            return HttpResponse::BadRequest().json(json!({"message": "File size too large"}));
        }

        let admin = match collection.find_one(doc! { "id": form.id.0.clone() }).await {
            Ok(Some(admin)) => admin,
            Ok(None) => return HttpResponse::NotFound().json(json!({"message": "Admin not found"})),
            Err(err) => return HttpResponse::InternalServerError().json(json!({"message": err.to_string()})),
        };
        let path = PathBuf::from(admin.image);

        if fs::copy(image.file.path(), &path).is_err() {
            return HttpResponse::InternalServerError().json(json!({"message": "Unable to save image"}));
        }
        update_doc.insert("image", path.to_str().unwrap());
    }
    
    if update_doc.is_empty() {
        return HttpResponse::BadRequest().json(json!({"message": "No valid fields provided for update"}));
    }
    println!("{:?}",update_doc);
    println!("executed till now");
    match collection.update_one(doc! { "id": form.id.0.clone() }, doc! { "$set": update_doc }).await {
        Ok(result) if result.modified_count > 0 => HttpResponse::Ok().json(json!({"message": "Admin updated successfully"})),
        Ok(_) => HttpResponse::Ok().json(json!({"message": "Admin updated successfully"})),
        Err(err) => HttpResponse::InternalServerError().json(json!({"message": err.to_string()})),
    }
}

#[delete("/delete/")]
pub async fn delete(client: Data<Client>, query: Query<std::collections::HashMap<String, String>>) -> impl Responder {
    let collection: Collection<Admin> = client.database("voteIndia").collection("admin");
   
    let admin_id: i64 = match query.get("id") {
        Some(id) => id.parse().unwrap(),
        None => return HttpResponse::BadRequest().json(json!({"message": "Invalid or missing admin ID"})),
    };
    println!("{}",admin_id);
    match collection.delete_one(doc! { "id": admin_id as i64 }).await {
        Ok(result) if result.deleted_count > 0 => HttpResponse::Ok().json(json!({"message": "Admin deleted successfully"})),
        Ok(_) => HttpResponse::NotFound().json(json!({"message": "Admin not found"})),
        Err(err) => HttpResponse::InternalServerError().json(json!({"message": err.to_string()})),
    }
}

#[get("/get-admin")]
pub async fn get_all_admin(client: Data<Client>) -> impl Responder{
    let collection: Collection<Admin> = client.database(DB_NAME).collection(COLL_NAME);
    
    match collection.find(doc! {}).await {
        Ok(cursor) => {
            let users: Vec<Admin> = cursor.try_collect().await.unwrap_or_else(|_| vec![]);
            let response: Vec<_> = users.into_iter().map(|user| {
                json!({
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "isadmin" : user.is_admin,
                    "image":user.image,
                })
            }).collect();
            HttpResponse::Ok().json(response)
        }
        Err(_) => HttpResponse::InternalServerError().json(json!({"message": "unable to fetch voters"})),
    }
}
