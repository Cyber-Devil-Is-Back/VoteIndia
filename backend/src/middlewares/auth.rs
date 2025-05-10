// use actix_web::{
//     dev::{Service, ServiceRequest, ServiceResponse, Transform},
//     Error, HttpResponse,
// };

// use actix_web::body::EitherBody;

// use futures::future::{self, ready, LocalBoxFuture, Ready};
// use serde_json::json;
// use std::{future::Future, pin::Pin};
// use std::task::{Context, Poll};

// use crate::utils::jwt::validate_token; // Import validate_token


// pub struct Auth;

// pub struct  AuthMiddleware<S>{
//     service:S,
// }

// impl<S, B> Transform<S, ServiceRequest> for Auth
// where
//         S: Service<ServiceRequest, Response = ServiceResponse<EitherBody<B>>, Error = Error>,
//         S::Future: 'static,
//         B: 'static,
// {
//     type Response = ServiceResponse<EitherBody<B>>;
//     type Error = Error;
//     type Transform = AuthMiddleware<S>;
//     type InitError = ();
//     type Future = Ready<Result<Self::Transform, Self::InitError>>;
//     fn new_transform(&self, service: S) -> Self::Future {
//        ready(Ok(AuthMiddleware { service: service }))
//     }
// }

// impl<S, B> Service<ServiceRequest> for AuthMiddleware<S>
//     where
//     S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
//     B: actix_web::body::MessageBody + 'static, 
//     {
//         type Response = ServiceResponse<B>;
//         type Error = Error;
//         type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;
       
//         fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
//             self.service.poll_ready(cx)
//         }
//         fn call(&self, req: ServiceRequest) -> Self::Future {
//             match req.cookie("auth_token") {
//                 Some(auth_token) => {
//                     match validate_token(auth_token.value()) {
//                         Ok(claim) => {
//                                 if req.path().starts_with("/admin") && claim.admin == true || req.path().starts_with("/user") && claim.admin == false{
//                                     let future = self.service.call(req);
//                                     Box::pin(async move {
//                                         let response = future.await;
//                                         return response;
//                                     })
//                                 }
//                                 else {
//                                     let response = HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
//                                     return Box::pin(async move { 
//                                         Ok(req.into_response(response).map_into_right_body()) 
//                                     });
//                                 }

//                         }
//                         Err(_) => {
//                             let response = HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
//                             return Box::pin(async move { 
//                                 Ok(req.into_response(response).map_into_right_body()) 
//                             });
//                         }
                        
//                     }
//                 },
//                 None => {
//                     if req.path().contains("login"){
//                         let future = self.service.call(req);
//                         Box::pin(async move {
//                             let response = future.await;
//                                 return response;
//                                     })
//                     }
//                     else{
//                         let response = HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
//                         return Box::pin(async move { 
//                             Ok(req.into_response(response).map_into_right_body()) 
//                         });
//                     }
//                 }
//             } 
            
//         }
// }