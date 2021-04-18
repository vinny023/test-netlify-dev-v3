const mongo = require('./helper_functions/mongo')

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

exports.handler = async(event, context) => {
    
    try {                           
        const account = await mongo.accounts('getAccount', {query: JSON.parse(event.queryStringParameters.query)})    
        return {statusCode: 200, headers, body: JSON.stringify({account: account})}
    }
    catch(error) {
        console.log(error)
        return {statusCode: 500, headers, body: JSON.stringify({error: error})}
    }   

}