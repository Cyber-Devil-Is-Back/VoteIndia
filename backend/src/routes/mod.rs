mod admin;
mod user;
mod parties;



use actix_web::web;
// use crate::middlewares::auth::Auth; // Import the AuthMiddleware

pub fn user_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/user")
                
                .service(user::routes::login)
                .service(user::routes::register)
                .service(user::routes::generate_wallet)
                .service(user::routes::get_details)
                .service(user::routes::get_image)
                .service(user::routes::get_voter)
                .service(user::routes::get_user)
                .service(user::routes::update_password)
                .service(user::routes::get_adhar)
                .service(user::routes::check_id)
                .service(user::routes::get_all)
        )
        .service( web::scope("/party")
                .service(parties::constutiency::get_districts)
                .service(parties::constutiency::get_state)
                .service(parties::constutiency::get_national_states)
                .service(parties::constutiency::get_national_constituency)
                .service(parties::party::login_party)
                .service(parties::party::get_all_new_parties)
                .service(parties::party::register_party)
                .service(parties::party::update_status)
                .service(parties::party::get_national_parties)
                .service(parties::party::get_state_parties)
                .service(parties::party::get_party_by_state)
                .service(parties::party::get_state_party_by_id)
                .service(parties::party::get_state_party_by_name)
                .service(parties::nationalcandidate::get_all_candidates)
                .service(parties::nationalcandidate::get_all_new_candidates)
                .service(parties::nationalcandidate::register_candidate)
                .service(parties::nationalcandidate::update_candidate_status)
                .service(parties::statecandidates::get_all_candidates)
                .service(parties::statecandidates::get_all_new_candidates)
                .service(parties::statecandidates::register_candidate)
                .service(parties::statecandidates::update_candidate_status)
        )
        .service(
                web::scope("/admin")
                .service(admin::routes::login)
                .service(admin::routes::register)
                .service(admin::routes::update)
                .service(admin::routes::get_all_admin)
                .service(admin::routes::delete)
        );
}