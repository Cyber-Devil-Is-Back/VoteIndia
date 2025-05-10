const keythereum = require("keythereum");
const fs = require("fs");

const keystore = JSON.parse(fs.readFileSync("/home/anonymous/.etherum/test/keystore/UTC--2025-03-10T09-23-50.524867120Z--5232a11aced4d3e7e78685669486520683e88e4f", "utf8"));
const password = "Priyanshu2002@"; // Replace with your actual password

const privateKey = keythereum.recover(password, keystore);
console.log("Private Key:", privateKey.toString("hex"));
