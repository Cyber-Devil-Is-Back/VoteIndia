use std::env;

use argon2::{
    password_hash::{
         PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};
use base64::{prelude::BASE64_STANDARD, Engine};

pub fn hash_password(password : String) -> String {
    dotenv::dotenv().ok();
    let salt_value = env::var("SECRET_KEY").expect("SECRET_KEY must be set");
    let salt = SaltString::from_b64(&BASE64_STANDARD.encode(salt_value)).expect("Invalid salt format");
    let argon2 = Argon2::default();
    return argon2.hash_password(password.as_bytes(), &salt).unwrap().to_string();
}

pub fn verify_password(userpassword:&str,formpassword: &str) -> bool {
    let password_hash = PasswordHash::new(userpassword).unwrap();
    let argon2 = Argon2::default();
    return argon2.verify_password(formpassword.as_bytes(), &password_hash).is_ok();
}