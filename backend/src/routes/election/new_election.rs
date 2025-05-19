use std::process::{Command, Stdio};

use actix_web::{post, HttpResponse, Responder};
use regex::Regex;


#[post("/election/deploy")]
pub async fn deploy_election() -> impl Responder {
     let workspace_dir = "/workspaces/VoteIndia/blockchain";

    // Start `yes` process
    let yes_process = Command::new("yes")
        .stdout(Stdio::piped())
        .spawn()
        .expect("Failed to start `yes`");

    // Run Hardhat Ignition deploy and capture output
    let output = Command::new("npx")
        .arg("hardhat")
        .arg("ignition")
        .arg("deploy")
        .arg("ignition/modules/deploy.js")
        .arg("--network")
        .arg("geth")
        .arg("--reset")
        .current_dir(workspace_dir)
        .stdin(yes_process.stdout.unwrap())
        .output()
        .expect("Failed to run Hardhat deploy");

    let stdout = String::from_utf8(output.stdout)
        .expect("Output not valid UTF-8");
    println!("🔧 Raw Output:\n{}", stdout);

    // Match lines like: ModuleName#ContractName - 0xAddress
    let re = Regex::new(r#"(\w+)#(\w+)\s+-\s+(0x[a-fA-F0-9]{40})"#).unwrap();

    println!("\n✅ Deployed Contracts:");
    for cap in re.captures_iter(&stdout) {
        let module_name = &cap[1];
        let contract_name = &cap[2];
        let address = &cap[3];
        println!("- {}#{} deployed at {}", module_name, contract_name, address);
    }

    HttpResponse::Ok().body(stdout)
}