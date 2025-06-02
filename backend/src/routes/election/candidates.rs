

pub async fn get_condidates(mongodb:Data<Client>) {

    let client  = mongodb.database("VoteIndia");
    let election_type = client.collection("election").find(doc!{}).find(doc!{"_id":-1});
}