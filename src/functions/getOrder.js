const mongo = require('./helper_functions/mongo')

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

exports.handler = async(event, context) => {

    try {        
        const order = await mongo.suppliers('getOrder', {orderId: event.queryStringParameters.orderId})
        return {statusCode: 200, headers, body: JSON.stringify(order)}
    }
    catch(error) {
        return {statusCode: 500, headers, body: JSON.stringify(error)}
    }   

}