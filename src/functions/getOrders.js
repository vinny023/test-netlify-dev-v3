const mongo = require('./helper_functions/mongo')

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

exports.handler = async(event, context) => {

    try {    
        console.log(event.queryStringParameters.sort)
        
        let orders = []
        if (event.queryStringParameters.sort) {
        orders = await mongo.orders('getOrder', {query: JSON.parse(event.queryStringParameters.query),
                                                       sort: JSON.parse(event.queryStringParameters.sort) })    
        } else {
            orders = await mongo.orders('getOrder', {query: JSON.parse(event.queryStringParameters.query)})    
        }    
        return {statusCode: 200, headers, body: JSON.stringify({orders: orders})}
    }
    catch(error) {
        console.log(error)
        return {statusCode: 500, headers, body: JSON.stringify({error: error})}
    }   

}