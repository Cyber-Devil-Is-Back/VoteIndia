use std::{env, fs, path::PathBuf};
use actix_files::NamedFile;
use actix_multipart::form::MultipartForm;
use actix_web::{cookie::{time::Duration, Cookie, SameSite}, get, patch, post, web::{Data, Json, Query}, HttpRequest, HttpResponse, Responder};
use futures::TryStreamExt;
use mongodb::{bson::doc, Client, Collection};
use serde_json::{json, Value};
use uuid::Uuid;
use crate::utils::user::generate_account::create_account;
use crate::utils::common::jwt::generate_token;
use crate::utils::user::model::{Adhar, User};
use crate::utils::common::password::{hash_password, verify_password};
use super::forms::{RegisterUser,LoginForm, UpdatePassword, UserQuery};

const DB_NAME: &str = "voteIndia";
const COLL_NAME: &str = "users";
const MAX_FILE_SIZE: usize = 10 * 1024 * 1024; // 10 MB max file size


fn message(msg: &str) -> Value {
    json!({ "message": msg })
}

#[post("/login")]
pub async  fn login(client: Data<Client>, form: Json<LoginForm>) -> impl Responder{
    let collection: Collection<User> = client.database(DB_NAME).collection(COLL_NAME);
    match collection.find_one(doc! { "id": &form.id }).await {
        Ok(Some(user)) => {
            // Verify the password
            if verify_password(&user.password,&form.password ) {
                let auth = generate_token(form.id.clone()).unwrap();
                let cookie= Cookie::build("auth_token", auth)
                                                .max_age(Duration::minutes(30))
                                                .http_only(true)
                                                .secure(true)
                                                .path("/")
                                                .same_site(SameSite::None)
                                                .finish();
                HttpResponse::Ok().cookie(cookie).json(message("Login successful"))
            } else {
                HttpResponse::Unauthorized().json(message("Invalid credentials"))
            }
        }
        Ok(None) => HttpResponse::NotFound().json(message("Invalid Credentials")),
        Err(err) => HttpResponse::InternalServerError().json(message(err.to_string().as_str()))
    }
}
// client: Data<Client>, form: MultipartForm<RegisterUser>
#[post("/register")]
pub async fn register( client: Data<Client>, form: MultipartForm<RegisterUser>) -> impl Responder {
    dotenv::dotenv().ok();
    let collection: Collection<User> = client.database(DB_NAME).collection(COLL_NAME);

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

    let file_name = format!("{}.{}", Uuid::new_v4(), "jpg");
    let mut path = PathBuf::from(upload_dir);
    path.push(&file_name);
    println!("{:?}",path);
    if let Err(_) = fs::copy(form.image.file.path(), &path) {
        return HttpResponse::InternalServerError().json(message("Unable to save image"));
    }
   
    let user = User {
        id: form.id.0,
        username: form.username.0.clone(),
        password: password,
        walletaddress: form.walletaddress.0.clone(), // You might want to add wallet handling
        image:path.to_str().unwrap().to_string(),
        face_descriptor: form.face_descriptor.0.clone(),
        email: form.email.0.clone(),
        state: form.state.0.clone(),
        is_voted: false

    };
    match collection.insert_one(user).await {
        Ok(_) => HttpResponse::Created().json(json!({"message": "User registered successfully"})),
        Err(err) => {
            eprintln!("{}",err);
            HttpResponse::InternalServerError().json(message("unable to register user"))},
    }
   
}

#[get("/generate-wallet")]
pub async  fn generate_wallet() -> impl Responder{
    match create_account().await {
        Ok(addr) => return  HttpResponse::Ok().json(json!({
            "address": addr
        }))
        ,
        Err(_) => return HttpResponse::InternalServerError().json(message("unable to generate wallet address")),
    };
}
#[patch("update-password")]
pub async  fn update_password(client: Data<Client>, form: Json<UpdatePassword>) -> impl Responder{
    let collection: Collection<User> = client.database(DB_NAME).collection(COLL_NAME);
    let password =hash_password(form.password.clone());
    match collection.update_one(
            doc! { "id": &form.id.clone() },
            doc! { "$set": { "password": &password } },
        )
        .await
    {
        Ok(update_result) => {
            if update_result.matched_count == 0 {
                HttpResponse::NotFound().json(message("User not found"))
            } else {
                HttpResponse::Ok().json(message("Password updated successfully"))
            }
        }
        Err(_) => HttpResponse::InternalServerError().json(message("unable to update wallet")),
    }
}
#[get("/get-voter")]
pub async fn get_voter(client: Data<Client>,query: Query<UserQuery>) -> impl Responder {
    let collection: Collection<User> = client.database(DB_NAME).collection(COLL_NAME);

    match collection.find_one(doc! { "id": &query.id}).await {
        Ok(Some(user)) => {
            let response = json!( {
                "id": user.id,
                "username": user.username,
                "wallet_address": user.walletaddress, // Assuming this is the correct field name
            });
            HttpResponse::Ok().json(response)
        }
        Ok(None) => HttpResponse::NotFound().json(message("unable to get voter data")),
        Err(_) => HttpResponse::InternalServerError().json(message("unable to get voter data")),
    }
}
#[get("/get-user/")]
pub async fn get_user(client: Data<Client>,query: Query<UserQuery>) -> impl Responder {
    let collection: Collection<User> = client.database(DB_NAME).collection(COLL_NAME);

    match collection.find_one(doc! { "id": &query.id}).await {
        Ok(Some(user)) => {
            let response = json!( {
                "id": user.id,
                "username": user.username,
                "email":user.email,
                "state": user.state,
                "wallet_address": user.walletaddress, 
                "is_voted" : user.is_voted
            });
            HttpResponse::Ok().json(response)
        }
        Ok(None) => HttpResponse::NotFound().json(message("unable to get users data")),
        Err(_) => HttpResponse::InternalServerError().json(message("unable to get users data"))
    }
}
#[get("/face-descriptor/")]
pub async fn get_details(client: Data<Client>,query: Query<UserQuery>) -> impl Responder {
    let collection: Collection<User> = client.database(DB_NAME).collection(COLL_NAME);

    match collection.find_one(doc! { "id": &query.id}).await {
        Ok(Some(user)) => {
            let response = json!( {
                "id": user.id,
                "face_descriptor":user.face_descriptor 
            });
            HttpResponse::Ok().json(response)
        }
        Ok(None) => HttpResponse::NotFound().json(message("unable to get data")),
        Err(_) => HttpResponse::InternalServerError().json(message("unable to get  data")),
    }
}

#[get("/image/")]
pub async fn get_image(req: HttpRequest,client: Data<Client>, query: Query<UserQuery>) -> impl Responder {
    let collection: Collection<User> = client.database(DB_NAME).collection(COLL_NAME);

    match collection.find_one(doc! { "id": query.id }).await {
        Ok(Some(user)) => {
            let image_path = PathBuf::from(user.image); // Convert image path string to PathBuf
            match NamedFile::open(image_path) {
                Ok(file) => file.into_response(&req), // Serve the image file
                Err(_) => HttpResponse::NotFound().body("Image not found"),
            }
        }
        Ok(None) => HttpResponse::NotFound().body("User not found"),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}
#[get("/adhar/")]
pub async fn get_adhar(client: Data<Client>, query: Query<UserQuery>) -> impl Responder {
    println!("{:?}",query.0.id);
    let collection: Collection<Adhar> = client.database(DB_NAME).collection("adhar");

    match collection.find_one(doc! { "id": query.0.id as i64 }).await {
        Ok(Some(user)) => {
            let response = json!( {
                "name":user.name,
                "email":user.email,
                "state":user.state
            });
            HttpResponse::Ok().json(response)   
        }
        Ok(None) => HttpResponse::NotFound().json(message("User not found")),
        Err(d) => {
            eprintln!("{}",d.to_string());
            HttpResponse::InternalServerError().json(message("No data Found"))},
    }
}
#[get("/check-id/")]
pub async fn check_id(client: Data<Client>, query: Query<UserQuery>) -> impl Responder{
    let collection: Collection<Adhar> = client.database(DB_NAME).collection(DB_NAME);
    match collection.find_one(doc! { "id": query.id }).await {
        Ok(Some(_user)) => {
            HttpResponse::Ok().json(message("user found"))   
        }
        Ok(None) => HttpResponse::NotFound().json(message("User not found")),
        Err(_) => HttpResponse::InternalServerError().json(message("No data Found")),
    }
}

#[get("/get-voters")]
pub async fn get_all(client: Data<Client>) -> impl Responder {
    let collection: Collection<User> = client.database(DB_NAME).collection(COLL_NAME);
    
    match collection.find(doc! {}).await {
        Ok(cursor) => {
            let users: Vec<User> = cursor.try_collect().await.unwrap_or_else(|_| vec![]);
            let response: Vec<_> = users.into_iter().map(|user| {
                json!({
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "state": user.state,
                    "image":user.image,
                    "wallet_address": user.walletaddress,
                    "is_voted" : user.is_voted
                })
            }).collect();
            HttpResponse::Ok().json(response)
        }
        Err(_) => HttpResponse::InternalServerError().json(json!({"message": "unable to fetch voters"})),
    }
}