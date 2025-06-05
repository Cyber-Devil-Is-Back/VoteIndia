#![allow(dead_code)]
use web3::contract::{Error, tokens::Detokenize};
use web3::ethabi::Token;

pub struct StateResult{
    pub name: String,
    pub constutiencies: Vec<ConstutiencyResult>,
}
pub struct District{
    pub name: String,
    pub constutiencies: Vec<ConstutiencyResult>,
}
pub struct ConstutiencyResult{
    pub name: String,
    pub candidates: Vec<CandidateResult>,
}
pub struct CandidateResult{
    pub id :u128,
    pub votes:u128,
}

impl Detokenize for StateResult {
    fn from_tokens(tokens: Vec<Token>) -> Result<Self, Error> {
        if tokens.len() != 2 {
            return Err(Error::InvalidOutputType(format!(
                "Expected 2 tokens, got {}",
                tokens.len()
            )));
        }

        let name = tokens[0].clone().into_string().unwrap();
        let constutiencies_tokens = tokens[1].clone().into_array().unwrap();

        let mut constutiency_results = Vec::new();
        for constutiency_token in constutiencies_tokens {
            let constutiency = constutiency_token.into_array().unwrap();
            let constutiency_name = constutiency[0].clone().into_string().unwrap();
            let candidates_tokens = constutiency[1].clone().into_array().unwrap();

            let mut candidate_results = Vec::new();
            for candidate_token in candidates_tokens {
                let candidate = candidate_token.into_array().unwrap();
                let id = candidate[0].clone().into_uint().unwrap().as_u64() as u128;
                let votes = candidate[1].clone().into_uint().unwrap().as_u64() as u128;
                candidate_results.push(CandidateResult { id, votes });
            }

            constutiency_results.push(ConstutiencyResult { name: constutiency_name, candidates: candidate_results });
        }

        Ok(StateResult { name, constutiencies: constutiency_results })

    }
}

impl Detokenize for District {
    fn from_tokens(tokens: Vec<Token>) -> Result<Self, Error> {
        if tokens.len() != 2 {
            return Err(Error::InvalidOutputType(format!(
                "Expected 2 tokens, got {}",
                tokens.len()
            )));
        }

        let name = tokens[0].clone().into_string().unwrap();
        let constutiencies_tokens = tokens[1].clone().into_array().unwrap();

        let mut constutiency_results = Vec::new();
        for constutiency_token in constutiencies_tokens {
            let constutiency = constutiency_token.into_array().unwrap();
            let constutiency_name = constutiency[0].clone().into_string().unwrap();
            let candidates_tokens = constutiency[1].clone().into_array().unwrap();

            let mut candidate_results = Vec::new();
            for candidate_token in candidates_tokens {
                let candidate = candidate_token.into_array().unwrap();
                let id = candidate[0].clone().into_uint().unwrap().as_u64() as u128;
                let votes = candidate[1].clone().into_uint().unwrap().as_u64() as u128;
                candidate_results.push(CandidateResult { id, votes });
            }

            constutiency_results.push(ConstutiencyResult { name: constutiency_name, candidates: candidate_results });
        }

        Ok(District { name, constutiencies: constutiency_results })
    }
}

impl Detokenize for CandidateResult {
    fn from_tokens(tokens: Vec<Token>) -> Result<Self, Error> {
        if tokens.len() != 2 {
            return Err(Error::InvalidOutputType(format!(
                "Expected 2 tokens, got {}",
                tokens.len()
            )));
        }

        let id = tokens[0].clone().into_uint().unwrap().as_u64() as u128;
        let votes = tokens[1].clone().into_uint().unwrap().as_u64() as u128;

        Ok(CandidateResult { id, votes })
    }
}
impl Detokenize for ConstutiencyResult {
    fn from_tokens(tokens: Vec<Token>) -> Result<Self, Error> {
        if tokens.len() != 2 {
            return Err(Error::InvalidOutputType(format!(
                "Expected 2 tokens, got {}",
                tokens.len()
            )));
        }

        let name = tokens[0].clone().into_string().unwrap();
        let candidates_tokens = tokens[1].clone().into_array().unwrap();

        let mut candidate_results = Vec::new();
        for candidate_token in candidates_tokens {
            let candidate = candidate_token.into_array().unwrap();
            let id = candidate[0].clone().into_uint().unwrap().as_u64() as u128;
            let votes = candidate[1].clone().into_uint().unwrap().as_u64() as u128;
            candidate_results.push(CandidateResult { id, votes });
        }

        Ok(ConstutiencyResult { name, candidates: candidate_results })
    }
}