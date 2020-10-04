


//import credentials from "../credentials.json"

const CryptoJS = require("crypto-js");
const fetch = require('node-fetch');

const ApiMedicHost = 'https://sandbox-healthservice.priaid.ch';
const AuthHost = 'https://authservice.priaid.ch';
const password = 'a8NZo95Azi3C6Xpd4';
const user_id = 'p2AHy_GMAIL_COM_AUT';

const getToken = (req,res) => {
    const computedHash = CryptoJS.HmacMD5(`${AuthHost}/login`, password);
    const computedHashString = computedHash.toString(CryptoJS.enc.Base64);
  
    console.log("HI");
    return fetch(`${AuthHost}/login`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user_id}:${computedHashString}`
      }
    })
    .then(res => res.json())
    .then(data => console.log(data.Token));
  };

  module.exports = {
    getToken
}