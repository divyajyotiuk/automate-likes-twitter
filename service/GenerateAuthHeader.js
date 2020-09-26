const env = require('dotenv').config({ path: '../.env' });
const cryptoRandomString = require('crypto-random-string');
const CryptoJS = require("crypto-js");
const Base64 = require('crypto-js/enc-base64');

const signingKey = `${process.env.API_SECRET}&${process.env.ACCESS_TOKEN_SECRET}`;

function buildParameterString(param, timestamp, nonce){
    let key = null;
    let value = null;
    if(Object.keys(param).length == 1){
        let keys = Object.keys(param);
        key = keys[0];
        value = encodeURIComponent(param[key]);
    }
    console.log('param : ',timestamp, nonce)
    return `${key}=${value}` + `&` + `oauth_consumer_key=${process.env.API_KEY}` + `&` +
            `oauth_nonce=${nonce}` + `&` +
            `oauth_signature_method=HMAC-SHA1` + `&` +
            `oauth_timestamp=${timestamp}` + `&` +
            `oauth_token=${process.env.ACCESS_TOKEN}` + `&` +
            `oauth_version=1.0`;
}

function buildSignatureBaseString(data){
    const {method, param, api, timestamp, nonce} = data;
    let methodUppercase = String(method).toUpperCase()
    ,   encodedApi = encodeURIComponent(api)
    ,   encodedParamString = encodeURIComponent(buildParameterString(param, timestamp, nonce));
    ;

    return `${methodUppercase}` + `&` + `${encodedApi}` + `&` + `${encodedParamString}`;
}

module.exports = function AuthStringGenerator(data){
    const timestamp = Math.round(Date.now()/1000);
    const nonce = cryptoRandomString({length: 42, type: 'alphanumeric'});
    data['timestamp'] = timestamp;
    data['nonce'] = nonce;
    let signatureBaseString = buildSignatureBaseString(data)
    ,   oAuthSignature = Base64.stringify(CryptoJS.HmacSHA1(signatureBaseString, signingKey))
    ,   encodedAuthSign = encodeURIComponent(oAuthSignature)
    ;
    console.log('main : ',timestamp, nonce)
   return `OAuth oauth_consumer_key="${process.env.API_KEY}", ` + 
            `oauth_nonce="${nonce}", ` +
            `oauth_signature="${encodedAuthSign}", ` +
            `oauth_signature_method="HMAC-SHA1", ` +
            `oauth_timestamp="${timestamp}", ` + 
            `oauth_token="${process.env.ACCESS_TOKEN}", ` +
            `oauth_version="1.0"`;
}