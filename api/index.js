const env = require('dotenv').config({ path: '../.env' });
const needle = require('needle');
const Twit = require('twit');
/**
 * AuthorizationHeader
 * @param method String
 * @param params Object
 * @param api String
 */
const AuthStringGenerator = require('../service/GenerateAuthHeader');

const TwitterClient = new Twit({
    consumer_key:         process.env.API_KEY,
    consumer_secret:      process.env.API_SECRET,
    access_token:         process.env.ACCESS_TOKEN,
    access_token_secret:  process.env.ACCESS_TOKEN_SECRET
});

const token = process.env.BEARER_TOKEN;

const getMentionsApi = 'https://api.twitter.com/2/tweets/search/recent';
const postLikesApi = 'https://api.twitter.com/1.1/favorites/create.json';

async function getTweetsWithMentions() {
    const params = {
        'query': '@divyajyotiuk'
    } 

    const res = await needle('get', getMentionsApi, params, { headers: {
        "authorization": `Bearer ${token}`
    }})

    if(res.body) {
        let data = res.body && res.body.data;
        return data.map((i)=>{return i.id});
    } else {
        throw new Error ('Unsuccessful request')
    }
}

async function postLikesOnMentions(params) {
    
    const oAuthParams = {
        method: 'post',
        param: params,
        api: postLikesApi
    }
    const oAuthHeader = AuthStringGenerator(oAuthParams);

    const res = await needle('post', postLikesApi, params, { headers: {
        "authorization": oAuthHeader
    }})

    if(res.body) {
        return res.body;
    } else {
        throw new Error ('Unsuccessful request')
    }
}

module.exports = async (req, res) => {
    let httpResponse = res;
    try {
        // Make request
        const twitterIds = await getTweetsWithMentions();
        console.log(twitterIds)
        let results = [];
        await twitterIds.reduce(async (promise, id) => {
            await promise; //for the last promise in the chain to resolve
            const params = {
                "id": id
            } 
            const res = await postLikesOnMentions(params);
            if(!res){
                httpResponse.status(500).send(`Some error occurred`)
            }
            if(res.errors){
                results.push(res.errors);
            }else{
                results.push(res.favorited);
            }
            console.log(res);
            
            if(results.length == twitterIds.length){
                httpResponse.status(200).send(results)
            }
        }, Promise.resolve());

        //very easy using Twit 
        // const params = {
        //     id: '1309222192866041857'
        // }   
        // await TwitterClient.post('favorites/create', params, function(err, data, response){
        //     console.log("data :: ",response);
        // })

    } catch(e) {
        console.log('catch block ', e);
        httpResponse.status(500).send(`Some error occurred `+e)
    }
}


//Uncomment for running on the terminal $ node index.js
// (async () => {
//     try {
//         // Make request
//         const twitterIds = await getTweetsWithMentions();
//         console.log(twitterIds)

//         await twitterIds.reduce(async (promise, id) => {
//             await promise; //for the last promise in the chain to resolve
//             const params = {
//                 "id": id
//             } 
//             const res = await postLikesOnMentions(params);
//             console.log(res.errors);
//         }, Promise.resolve());

//         //very easy using Twit 
//         // const params = {
//         //     id: '1309222192866041857'
//         // }   
//         // await TwitterClient.post('favorites/create', params, function(err, data, response){
//         //     console.log("data :: ",response);
//         // })

//     } catch(e) {
//         console.log('catch block ', e);
//         process.exit(-1);
//     }
//     process.exit();
// })();