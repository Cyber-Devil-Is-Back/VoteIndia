
use actix_multipart::form::{tempfile::TempFile, text::Text, MultipartForm};
use serde::Deserialize;




#[derive(Deserialize)]
pub struct AdminLoginForm {
    pub email: String,
    pub password: String,
}
#[derive(MultipartForm,Debug)]
pub struct RegisterAdmin {
    pub id: Text<i64> ,
    pub username: Text<String>,
    pub password: Text<String>,
    pub email: Text<String>,
    pub isadmin : Text<bool>,
    pub image : TempFile
}

#[derive(MultipartForm,Debug)]
pub struct UpdateAdmin {
    pub id: Text<i64> ,
    pub username: Option<Text<String>>,
    pub password: Option<Text<String>>,
    pub email: Option<Text<String>>,
    pub isadmin : Option<Text<bool>>,
    pub image : Option<TempFile>
}


