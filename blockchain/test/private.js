const { ethers } = require("ethers");

// Your keystore JSON
const keystoreJson = {
  address: "4b57d90db33913f208307db97834abc98ae4fd7d",
  crypto: {
    cipher: "aes-128-ctr",
    ciphertext: "000a18529306dcb92b4b761ae8dbf67f12e6852ee240033ce2886ac148ca36f5",
    cipherparams: { iv: "7e2a9b8ef42f326d9c4c6f338278c4ba" },
    kdf: "scrypt",
    kdfparams: {
      dklen: 32,
      n: 262144,
      p: 1,
      r: 8,
      salt: "2af6ae895a88dfb9e419b35be648b282b0a8674ae1263f47a1e387a96ded73c8",
    },
    mac: "e1aaab4ea4b69a8e943885926443c51ea06ed1d70e058e680a97264c38d81503",
  },
  id: "e821fabc-ffac-405d-8e15-9ce538591005",
  version: 3,
};

// Password for the keystore
const password = "Priyanshu14"; // Replace with your actual password

// Decrypt the keystore
async function decryptKeystore() {
  try {
    // Decrypt the private key
    const wallet = await ethers.Wallet.fromEncryptedJson(JSON.stringify(keystoreJson), password);

    console.log("Decrypted Wallet Details:");
    console.log("Address:", wallet.address);
    console.log("Private Key:", wallet.privateKey);
  } catch (error) {
    console.error("Failed to decrypt keystore:", error.message);
  }
}

// Run the decryption
decryptKeystore();