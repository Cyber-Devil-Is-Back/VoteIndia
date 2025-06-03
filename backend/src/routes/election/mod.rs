pub mod new_election;
pub mod nomimations;
pub mod voting;
use std::{env,error::Error,process::{Command, Stdio},};
use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq,Serialize,Deserialize,Clone)]
pub enum ElectionType {
    LokSabha,
    VidhanSabha,
}

#[derive(Serialize, Deserialize)]
struct Electiondata{
    pub address:String,
    pub etype:ElectionType,
    pub state:Option<String>,
    pub date: i64,
    pub next_date:i64
}

pub fn create_election(election_type: ElectionType, state: Option<String>,date:i64) -> Result<String, Box<dyn Error>> {
    let token_address = env::var("SWARAJTOKEN_CONTRACT_ADDRESS")
            .expect("Please add SWARAJTOKEN_CONTRACT_ADDRESS in .env file");

        let workdir = env::current_dir()?.parent().unwrap().join("blockchain");

        let yes_process = Command::new("yes")
            .stdout(Stdio::piped())
            .spawn()
            .expect("Failed to start `yes`");

        let mut command = Command::new("npx");
        command
            .arg("hardhat")
            .arg("ignition")
            .arg("deploy");

        match election_type {
            ElectionType::LokSabha => {
                command.arg("ignition/modules/LokSabha.js");
                command.env("tokenaddress", token_address);
                command.env("date", date.to_string());
            },
            ElectionType::VidhanSabha => {
                let state_name = state.expect("State must be provided for LokSabha election");
                command.arg("ignition/modules/VidhanSabha.js");
                command.env("tokenaddress", token_address);
                command.env("state", state_name);
                command.env("date", date.to_string());
            },
        }
        let output = command.arg("--network").arg("geth").arg("--reset")
            .current_dir(workdir)
            .stdin(yes_process.stdout.unwrap())
            .output()
            .expect("Failed to run Hardhat deploy");
        let stdout = String::from_utf8(output.stdout)?;
        // Regex to find address
        let re = Regex::new(r#"(\w+)#(\w+)\s+-\s+(0x[a-fA-F0-9]{40})"#)?;
        if let Some(cap) = re.captures(&stdout) {
            let address = &cap[3];
            return Ok(address.to_string());
        } else {
            return Err("Contract address not found in output".into());
        }
}

