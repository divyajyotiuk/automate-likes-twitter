const env = require('dotenv').config({ path: '../.env' });
const cryptoRandomString = require('crypto-random-string');
const CryptoJS = require("crypto-js");
const Base64 = require('crypto-js/enc-base64');

const signingKey = `${process.env.API_SECRET}&${process.env.ACCESS_TOKEN_SECRET}`;
const nonce = cryptoRandomString({length: 42, type: 'base64'});

function buildParameterString(param){
    const timestamp = Math.round(Date.now()/1000);
    let key = null;
    let value = null;
    if(Object.keys(param).length == 1){
        let keys = Object.keys(param);
        key = keys[0];
        value = encodeURIComponent(param[key]);
    }
    console.log(timestamp, nonce);
    return `${key}=${value}` + `&` + `oauth_consumer_key=${process.env.API_KEY}` + `&` +
            `oauth_nonce=${nonce}` + `&` +
            `oauth_signature_method=HMAC-SHA1` + `&` +
            `oauth_timestamp=${timestamp}` + `&` +
            `oauth_token=${process.env.ACCESS_TOKEN}` + `&` +
            `oauth_version=1.0`;
}

function buildSignatureBaseString(method, param, api){
    let methodUppercase = String(method).toUpperCase()
    ,   encodedApi = encodeURIComponent(api)
    ,   encodedParamString = encodeURIComponent(buildParameterString(param));
    ;

    return `${methodUppercase}` + `&` + `${encodedApi}` + `&` + `${encodedParamString}`;
}

module.exports = function AuthStringGenerator(method, param, api){
    const timestamp = Math.round(Date.now()/1000);
    let signatureBaseString = buildSignatureBaseString(method, param, api)
    ,   oAuthSignature = Base64.stringify(CryptoJS.HmacSHA1(signatureBaseString, signingKey))
    ,   encodedAuthSign = encodeURIComponent(oAuthSignature)
    ;
    console.log(timestamp, nonce)
   return `OAuth oauth_consumer_key="${process.env.API_KEY}", ` + 
            `oauth_nonce="${nonce}", ` +
            `oauth_signature="${encodedAuthSign}", ` +
            `oauth_signature_method="HMAC-SHA1", ` +
            `oauth_timestamp="${timestamp}", ` + 
            `oauth_token="${process.env.ACCESS_TOKEN}", ` +
            `oauth_version="1.0"`;
}